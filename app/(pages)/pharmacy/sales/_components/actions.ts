// app/(dashboard)/sales/actions.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SaleActionState =
  | { success: true; message: string }
  | { success: false; error: string }
  | null;

export type SaleItemInput = {
  name: string;
  unitPrice: number;
  quantity: number;
  productId: string | null;
};

export type ProductFromServer = {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  expires: string | null;
};

/**
 * Get the pharmacy ID for the current authenticated user
 * @throws Error if no station or pharmacy is found
 */
async function getUserPharmacyId(userId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    throw new Error("No station assigned to this user");
  }

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { hospitalId: profile.stationId },
    select: { id: true },
  });

  if (!pharmacy?.id) {
    throw new Error("No pharmacy configured for this station");
  }

  return pharmacy.id;
}

/**
 * Fetch all products available in the user's pharmacy
 */
export async function getPharmacyProductsAction(): Promise<
  | { success: true; products: ProductFromServer[] }
  | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const pharmacyId = await getUserPharmacyId(session.user.id);

    const products = await prisma.product.findMany({
      where: { pharmId: pharmacyId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        cost: true,
        quantity: true,
        expires: true,
      },
    });

    return { success: true, products };
  } catch (err) {
    console.error("[getPharmacyProductsAction]", err);
    const message = err instanceof Error ? err.message : "Failed to load products";
    return { success: false, error: message };
  }
}

/**
 * Save (create or update) a sale and handle inventory deduction
 */
export async function saveSaleAction(
  _prevState: SaleActionState,
  formData: FormData
): Promise<SaleActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const saleId = formData.get("saleId")?.toString() ?? null;
    const itemsJson = formData.get("items")?.toString();

    if (!itemsJson) {
      return { success: false, error: "No items data received" };
    }

    let parsedItems: SaleItemInput[];
    try {
      parsedItems = JSON.parse(itemsJson);
    } catch {
      return { success: false, error: "Invalid items format (JSON parse failed)" };
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return { success: false, error: "At least one item is required" };
    }

    const pharmacyId = await getUserPharmacyId(session.user.id);

    // 1. Validate items & enrich with real product data when applicable
    const validatedItems = await Promise.all(
      parsedItems.map(async (input) => {
        if (!input.name?.trim()) {
          throw new Error("Every item must have a name");
        }

        if (input.quantity < 1 || !Number.isInteger(input.quantity)) {
          throw new Error("Quantity must be positive integer");
        }

        let finalPrice = input.unitPrice;
        let linkedProduct: { id: string; name: string; cost: number; quantity: number; pharmId: string } | null = null;

        if (input.productId) {
          linkedProduct = await prisma.product.findUnique({
            where: { id: input.productId },
            select: {
              id: true,
              name: true,
              cost: true,
              quantity: true,
              pharmId: true,
            },
          });

          if (!linkedProduct) {
            throw new Error(`Product not found: ${input.productId}`);
          }

          if (linkedProduct.pharmId !== pharmacyId) {
            throw new Error(`Product "${linkedProduct.name}" does not belong to your pharmacy`);
          }

          if (linkedProduct.quantity < input.quantity) {
            throw new Error(
              `Insufficient stock for "${linkedProduct.name}": ${linkedProduct.quantity} available, requested ${input.quantity}`
            );
          }

          finalPrice = linkedProduct.cost;
        }

        return {
          name: input.name.trim(),
          unitPrice: finalPrice,
          quantity: input.quantity,
          productId: input.productId ?? null,
          total: finalPrice * input.quantity,
        };
      })
    );

    const grandTotal = validatedItems.reduce((acc, item) => acc + item.total, 0);

    // 2. Atomic transaction: update/create sale + items + stock
    await prisma.$transaction(async (tx) => {
      let targetSaleId: string;

      if (saleId) {
        // ── UPDATE EXISTING SALE ──────────────────────────────────────
        const existing = await tx.sale.findUnique({
          where: { id: saleId },
          select: { id: true, pharmId: true },
        });

        if (!existing) {
          throw new Error("Sale not found");
        }

        if (existing.pharmId !== pharmacyId) {
          throw new Error("Unauthorized: You can only edit sales from your pharmacy");
        }

        targetSaleId = existing.id;

        await tx.saleItem.deleteMany({ where: { saleId: targetSaleId } });

        await tx.sale.update({
          where: { id: targetSaleId },
          data: { total: grandTotal },
        });
      } else {
        // ── CREATE NEW SALE ───────────────────────────────────────────
        const created = await tx.sale.create({
          data: {
            pharmId: pharmacyId,
            total: grandTotal,
          },
          select: { id: true },
        });

        targetSaleId = created.id;
      }

      // ── CREATE ITEMS ──────────────────────────────────────────────
      await tx.saleItem.createMany({
        data: validatedItems.map((item) => ({
          saleId: targetSaleId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          total: item.total,
          productId: item.productId,
        })),
      });

      // ── DEDUCT STOCK ──────────────────────────────────────────────
      for (const item of validatedItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }
      }
    });

    revalidatePath("/sales");

    return {
      success: true,
      message: saleId ? "Sale updated successfully" : "Sale recorded successfully",
    };
  } catch (err) {
    console.error("[saveSaleAction]", err);

    let errorMessage = "Failed to process sale";

    if (err instanceof Error) {
      errorMessage = err.message;
      // Optional: make some messages more user-friendly
      if (errorMessage.includes("Insufficient stock")) {
        errorMessage = errorMessage; // already good
      } else if (errorMessage.includes("not found")) {
        errorMessage = "One or more products could not be found";
      }
    }

    return { success: false, error: errorMessage };
  }
}
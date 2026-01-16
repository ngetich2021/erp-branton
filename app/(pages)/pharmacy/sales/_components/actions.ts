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

export type SaleDetailFromServer = {
  id: string;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  pharmacyName: string;           // ← added for receipt display
  items: {
    name: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
};

const VALID_PAYMENT_METHODS = ["mpesa", "cash"] as const;
export type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];

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

export async function getPharmacyProductsAction(): Promise<
  { success: true; products: ProductFromServer[] } | { success: false; error: string }
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
    console.error("getPharmacyProductsAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load products",
    };
  }
}

export async function getSaleDetailsAction(saleId: string): Promise<
  { success: true; sale: SaleDetailFromServer } | { success: false; error: string }
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const pharmacyId = await getUserPharmacyId(session.user.id);

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          select: {
            name: true,
            unitPrice: true,
            quantity: true,
            total: true,
          },
          orderBy: { createdAt: "asc" },
        },
        pharmacy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!sale) {
      return { success: false, error: "Sale not found" };
    }

    if (sale.pharmId !== pharmacyId) {
      return { success: false, error: "Unauthorized: Not your pharmacy sale" };
    }

    return {
      success: true,
      sale: {
        id: sale.id,
        total: sale.total,                // already number in schema (Int)
        paymentMethod: sale.paymentMethod as PaymentMethod,
        createdAt: sale.createdAt,
        pharmacyName: sale.pharmacy?.name ?? "Unknown Pharmacy",
        items: sale.items.map((i) => ({
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          total: i.total,
        })),
      },
    };
  } catch (err) {
    console.error("getSaleDetailsAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load sale details",
    };
  }
}

export async function saveSaleAction(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const saleId = formData.get("saleId")?.toString() ?? null;
    const itemsRaw = formData.get("items")?.toString();
    const paymentMethodRaw = formData.get("paymentMethod")?.toString();

    if (!itemsRaw) {
      return { success: false, error: "No items data received" };
    }

    let items: SaleItemInput[];
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return { success: false, error: "Invalid items JSON format" };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: "At least one item is required" };
    }

    if (!paymentMethodRaw || !VALID_PAYMENT_METHODS.includes(paymentMethodRaw as PaymentMethod)) {
      return { success: false, error: "Payment method must be 'mpesa' or 'cash'" };
    }

    const pharmacyId = await getUserPharmacyId(session.user.id);

    const validatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.name?.trim()) {
          throw new Error("Item name is required");
        }

        if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
          throw new Error("Quantity must be positive integer ≥ 1");
        }

        let finalPrice = item.unitPrice;
        let product = null;

        if (item.productId) {
          product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              cost: true,
              quantity: true,
              pharmId: true,
            },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          if (product.pharmId !== pharmacyId) {
            throw new Error("Product does not belong to your pharmacy");
          }
          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for "${product.name}": ${product.quantity} available`);
          }

          finalPrice = product.cost;
        }

        return {
          name: item.name.trim(),
          unitPrice: finalPrice,
          quantity: item.quantity,
          productId: item.productId ?? null,
          total: finalPrice * item.quantity,
        };
      }),
    );

    const grandTotal = validatedItems.reduce((acc, i) => acc + i.total, 0);

    await prisma.$transaction(async (tx) => {
      // Decrease stock for inventory products
      for (const item of validatedItems) {
        if (item.productId) {
          const updated = await tx.product.update({
            where: {
              id: item.productId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
            select: { id: true },
          });

          if (!updated) {
            throw new Error(`Stock conflict for product ${item.productId}`);
          }
        }
      }

      let targetSaleId: string;

      if (saleId) {
        // Update existing sale
        const existing = await tx.sale.findUnique({
          where: { id: saleId },
          select: { id: true, pharmId: true },
        });

        if (!existing) throw new Error("Sale not found");
        if (existing.pharmId !== pharmacyId) throw new Error("Unauthorized");

        targetSaleId = existing.id;

        await tx.saleItem.deleteMany({ where: { saleId: targetSaleId } });

        await tx.sale.update({
          where: { id: targetSaleId },
          data: {
            total: grandTotal,
            paymentMethod: paymentMethodRaw,
          },
        });
      } else {
        // Create new sale
        const created = await tx.sale.create({
          data: {
            pharmId: pharmacyId,
            total: grandTotal,
            paymentMethod: paymentMethodRaw,
          },
          select: { id: true },
        });

        targetSaleId = created.id;
      }

      // Create sale items
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
    });

    revalidatePath("/sales");

    return {
      success: true,
      message: saleId ? "Sale updated successfully" : "Sale recorded successfully",
    };
  } catch (err) {
    console.error("saveSaleAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save sale",
    };
  }
}
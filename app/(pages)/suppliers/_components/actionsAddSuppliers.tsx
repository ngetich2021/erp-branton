"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSupplierAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId; // Always use user's assigned hospital

  const supplierId = formData.get("supplierId")?.toString() || null;
  const name = formData.get("name")?.toString().trim();
  const tel = formData.get("tel")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!name || !tel || !description) {
    return { error: "All required fields must be filled." };
  }

  try {
    if (supplierId) {
      // Security: Verify that the supplier belongs to the user's hospital
      const existingSupplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { hospitalId: true },
      });

      if (!existingSupplier || existingSupplier.hospitalId !== hospitalId) {
        return { error: "You cannot edit suppliers from another hospital." };
      }

      await prisma.supplier.update({
        where: { id: supplierId },
        data: { name, tel, description },
      });
    } else {
      // Create new supplier in user's hospital
      await prisma.supplier.create({
        data: {
          name,
          tel,
          description,
          hospitalId,
        },
      });
    }

    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Save supplier error:", error);
    return {
      error: supplierId ? "Failed to update supplier." : "Failed to add supplier.",
    };
  }
}

export async function deleteSupplierAction(supplierId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const hospitalId = profile.stationId;

  try {
    // Security: Verify ownership before deleting
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { hospitalId: true },
    });

    if (!supplier || supplier.hospitalId !== hospitalId) {
      throw new Error("You can only delete suppliers from your own hospital.");
    }

    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    revalidatePath("/suppliers");
  } catch (error) {
    console.error("Delete supplier error:", error);
    throw new Error("Failed to delete supplier.");
  }
}
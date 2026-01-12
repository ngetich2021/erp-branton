"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function savePharmacyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId;

  const pharmacyId = formData.get("pharmacyId")?.toString() || null;
  const name        = formData.get("name")?.toString().trim() || "";

  if (!name) {
    return { error: "Pharmacy name is required." };
  }

  try {
    if (pharmacyId) {
      // Update
      const existing = await prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
        select: { hospitalId: true },
      });

      if (!existing || existing.hospitalId !== hospitalId) {
        return { error: "You can only edit pharmacies in your own hospital." };
      }

      await prisma.pharmacy.update({
        where: { id: pharmacyId },
        data: { name },
      });
    } else {
      // Create - note: hospitalId is @unique → prevents multiple pharmacies per hospital
      const existing = await prisma.pharmacy.findFirst({
        where: { hospitalId },
      });

      if (existing) {
        return { error: "This hospital already has a pharmacy assigned." };
      }

      await prisma.pharmacy.create({
        data: {
          name,
          hospitalId,
        },
      });
    }

    revalidatePath("/pharmacies");
    return { success: true };
  } catch (error) {
    console.error("Pharmacy save error:", error);
    return {
      error: pharmacyId ? "Failed to update pharmacy." : "Failed to add pharmacy.",
    };
  }
}

export async function deletePharmacyAction(pharmacyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const hospitalId = profile.stationId;

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    select: { hospitalId: true },
  });

  if (!pharmacy || pharmacy.hospitalId !== hospitalId) {
    throw new Error("You can only delete pharmacies from your own hospital.");
  }

  await prisma.pharmacy.delete({ where: { id: pharmacyId } });
  revalidatePath("/pharmacies");
}
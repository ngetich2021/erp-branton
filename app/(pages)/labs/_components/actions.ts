"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveLabAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const labId     = formData.get("labId")?.toString() ?? null;
  const name      = formData.get("name")?.toString().trim() ?? "";
  const chargesStr = formData.get("charges")?.toString().trim() ?? "";

  if (!name || !chargesStr) {
    return { error: "Name and charges are required." };
  }

  const charges = Number(chargesStr);
  if (isNaN(charges) || charges < 0) {
    return { error: "Charges must be a non-negative number" };
  }

  try {
    if (labId) {
      // Update – no ownership check for now
      await prisma.labs.update({
        where: { id: labId },
        data: { name, charges },
      });
    } else {
      // Create
      await prisma.labs.create({
        data: {
          name,
          charges,
          // hospitalId,  // ← uncomment + add logic when you need per-hospital labs
        },
      });
    }

    revalidatePath("/labs");
    return { success: true };
  } catch (error) {
    console.error("Save lab error:", error);
    return {
      error: labId
        ? "Failed to update lab test."
        : "Failed to add lab test.",
    };
  }
}

export async function deleteLabAction(labId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // If you later want hospital-level protection, uncomment:
  /*
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    throw new Error("No hospital station assigned");
  }

  const hospitalId = profile.stationId;

  const lab = await prisma.labs.findUnique({
    where: { id: labId },
    select: { hospitalId: true },
  });

  if (!lab) {
    throw new Error("Lab test not found");
  }

  if (lab.hospitalId !== hospitalId) {
    throw new Error("You can only delete lab tests from your own hospital.");
  }
  */

  await prisma.labs.delete({ where: { id: labId } });
  revalidatePath("/labs");
}
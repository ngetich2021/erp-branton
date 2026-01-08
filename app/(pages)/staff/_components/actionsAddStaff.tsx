// app/staff/_components/actionsAddStaff.ts
'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveStaffAction(formData: FormData): Promise<ActionResult> {
  const userId = formData.get("userId") as string;
  if (!userId) return { success: false, error: "User ID is required." };

  const fullName = (formData.get("fullName") as string)?.trim() || null;
  const contact1 = (formData.get("contact1") as string)?.trim() || null;
  const contact2 = (formData.get("contact2") as string)?.trim() || null;
  const role = (formData.get("role") as string)?.trim() || "staff";
  const stationId = (formData.get("station") as string)?.trim() || null;

  try {
    await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName,
        contact1,
        contact2,
        role,
        stationId,
      },
      create: {
        userId,
        fullName,
        contact1,
        contact2,
        role,
        stationId,
      },
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Save staff failed:", error);
    return { success: false, error: "Failed to save staff." };
  }
}

export async function deleteStaffAction(userId: string): Promise<ActionResult> {
  try {
    await prisma.profile.delete({
      where: { userId },
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Delete staff failed:", error);
    return { success: false, error: "Failed to delete staff." };
  }
}

export async function getUsersRolesHospitals() {
  const [users, roles, hospitals] = await Promise.all([
    prisma.user.findMany({
      where: { email: { not: null } },
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.hospital.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    users: users as { id: string; email: string }[],
    roles: roles as { id: string; name: string }[],
    hospitals: hospitals as { id: string; name: string }[],
  };
}
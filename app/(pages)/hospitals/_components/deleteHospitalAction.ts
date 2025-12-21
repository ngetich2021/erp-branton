// app/hospitals/_components/deleteHospitalAction.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteHospitalAction(id: string) {
  try {
    await prisma.hospital.delete({
      where: { id },
    });
    revalidatePath("/hospitals");
  } catch (error) {
    console.error("Delete hospital error:", error);
    throw new Error("Failed to delete hospital.");
  }
}
// app/hospitals/_components/updateHospitalAction.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type FormState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function updateHospitalAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = formData.get("id") as string;
  const name = formData.get("hospital") as string;
  const location = formData.get("location") as string;
  const registration = formData.get("registration") as string;
  const incharge = (formData.get("incharge") as string) || null;

  if (!id) {
    return { error: "Hospital ID is missing." };
  }

  if (!name || !location || !registration) {
    return { error: "All required fields must be filled." };
  }

  try {
    await prisma.hospital.update({
      where: { id },
      data: {
        name,
        location,
        registrationNo: registration,
        incharge,
      },
    });

    revalidatePath("/hospitals");
    return { success: true, message: "Hospital updated successfully!" };
  } catch (error) {
    console.error("Update hospital error:", error);
    return { error: "Failed to update hospital. Please try again." };
  }
}
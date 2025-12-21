// addHospitalAction.ts or app/actions/addHospitalAction.ts
'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Simple inline type to fix "Unexpected any"
type ActionResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function addHospitalAction(
  prevState: ActionResult,  // ← Fixed: no more 'any'
  formData: FormData
): Promise<ActionResult> {
  const userId = formData.get("userId") as string;
  const name = (formData.get("hospital") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const registrationNo = (formData.get("registration") as string)?.trim();
  const incharge = (formData.get("incharge") as string) || null;

  if (!userId || !name || !location || !registrationNo) {
    return { error: "Please fill all required fields." };
  }

  try {
    await prisma.hospital.create({
      data: {
        userId,
        name,
        location,
        registrationNo,
        incharge,
      },
    });

    revalidatePath("/hospitals");
    return { success: true, message: "Hospital added successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add hospital." };
  }
}
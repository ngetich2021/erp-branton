"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function attendPatientAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const id = formData.get("id")?.toString();
  if (!id) return { error: "Patient ID is required" };

  const attended       = formData.get("attended")?.toString() || "attended";
  const prescription   = formData.get("prescription")?.toString() || null;
  const paymentMethod  = formData.get("paymentMethod")?.toString() || "mpesa";
  const doctorBillStr  = formData.get("doctorBill")?.toString() || "0";
  const testIdsJson    = formData.get("testIds")?.toString() || "[]";

  const doctorBill = Number(doctorBillStr);
  if (isNaN(doctorBill) || doctorBill < 0) {
    return { error: "Invalid doctor bill amount" };
  }

  let selectedLabIds: string[] = [];
  try {
    selectedLabIds = JSON.parse(testIdsJson);
    if (!Array.isArray(selectedLabIds)) throw new Error("Invalid format");
  } catch {
    return { error: "Invalid lab tests selection" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get the consultation fee already set by receptionist
      const currentBook = await tx.book.findUniqueOrThrow({
        where: { id },
        select: { consultationFee: true },
      });

      // 2. Get charges of selected labs
      const labs = selectedLabIds.length > 0
        ? await tx.labs.findMany({
            where: { id: { in: selectedLabIds } },
            select: { id: true, charges: true },
          })
        : [];

      const labsTotal = labs.reduce((sum, lab) => sum + lab.charges, 0);

      // 3. Final bill = consultation (reception) + doctor bill + labs
      const finalBill = currentBook.consultationFee + doctorBill + labsTotal;

      // 4. Update Book record
      await tx.book.update({
        where: { id },
        data: {
          attended,
          prescription,
          bill: finalBill,
          paymentMethod,
          // billMethod remains untouched or can be set if you want
          updatedAt: new Date(),
        },
      });

      // 5. Replace lab orders
      await tx.labOrder.deleteMany({ where: { bookId: id } });

      if (labs.length > 0) {
        await tx.labOrder.createMany({
          data: labs.map(lab => ({
            bookId: id,
            labId: lab.id,
          })),
        });
      }
    });

    revalidatePath("/attend");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to complete attendance" };
  }
}
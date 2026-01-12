"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveExpenseAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId;

  // Form data extraction
  const expenseId     = formData.get("expenseId")?.toString() || null;
  const transactionId = formData.get("transactionId")?.toString().trim() || "";
  const description   = formData.get("description")?.toString().trim() || "";
  const amountStr     = formData.get("amount")?.toString().trim() || "";

  if (!transactionId || !description || !amountStr) {
    return { error: "All required fields must be filled." };
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number" };
  }

  try {
    if (expenseId) {
      // Update
      const existing = await prisma.expense.findUnique({
        where: { id: expenseId },
        select: { hospitalId: true },
      });

      if (!existing || existing.hospitalId !== hospitalId) {
        return { error: "You cannot edit expenses from another hospital." };
      }

      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          transactionId,
          description,
          amount,
        },
      });
    } else {
      // Create
      await prisma.expense.create({
        data: {
          transactionId,
          description,
          amount,
          hospitalId,
        },
      });
    }

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Save expense error:", error);
    return {
      error: expenseId ? "Failed to update expense." : "Failed to add expense.",
    };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const hospitalId = profile.stationId;

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { hospitalId: true },
  });

  if (!expense || expense.hospitalId !== hospitalId) {
    throw new Error("You can only delete expenses from your own hospital.");
  }

  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath("/expenses");
}
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCreditAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const stationId = profile.stationId;

  const creditId       = formData.get("creditId")?.toString() || null;
  const bookId         = formData.get("bookId")?.toString().trim() || "";
  const totalAmountStr = formData.get("totalAmount")?.toString().trim() || "";
  const paidAmountStr  = formData.get("paidAmount")?.toString().trim() || "0";

  if (!bookId || !totalAmountStr) {
    return { error: "Patient selection and Total Amount are required." };
  }

  const totalAmount = Number(totalAmountStr);
  const paidAmount  = Number(paidAmountStr);

  if (isNaN(totalAmount) || totalAmount <= 0) {
    return { error: "Total amount must be a positive number" };
  }
  if (isNaN(paidAmount) || paidAmount < 0) {
    return { error: "Paid amount cannot be negative" };
  }
  if (paidAmount > totalAmount) {
    return { error: "Paid amount cannot exceed total amount" };
  }

  const balance = totalAmount - paidAmount;
  let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
  if (balance === 0) status = "PAID";
  else if (paidAmount > 0) status = "PARTIAL";

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { hospitalId: true },
    });

    if (!book || book.hospitalId !== stationId) {
      return { error: "Invalid patient record or not assigned to your hospital" };
    }

    if (creditId) {
      const existing = await prisma.credit.findUnique({
        where: { id: creditId },
        select: { bookId: true },
      });

      if (!existing) return { error: "Credit record not found" };
      if (existing.bookId !== bookId) {
        return { error: "Cannot change the associated patient record" };
      }

      await prisma.credit.update({
        where: { id: creditId },
        data: {
          totalAmount,
          paidAmount,
          balance,
          status,
        },
      });
    } else {
      const existing = await prisma.credit.findUnique({ where: { bookId } });
      if (existing) {
        return { error: "This patient already has an active credit record" };
      }

      await prisma.credit.create({
        data: {
          bookId,
          totalAmount,
          paidAmount,
          balance,
          status,
        },
      });
    }

    revalidatePath("/credits");
    return { success: true };
  } catch (error) {
    console.error("Save credit error:", error);
    return {
      error: creditId ? "Failed to update credit" : "Failed to create credit",
    };
  }
}

export async function deleteCreditAction(creditId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const stationId = profile.stationId;

  const credit = await prisma.credit.findUnique({
    where: { id: creditId },
    select: {
      book: { select: { hospitalId: true } },
      balance: true,
      status: true,
    },
  });

  if (!credit) throw new Error("Credit not found");
  if (credit.book.hospitalId !== stationId) {
    throw new Error("You can only delete credits from your own hospital");
  }
  if (credit.balance > 0 && credit.status !== "CANCELLED") {
    throw new Error("Cannot delete credit with remaining balance unless cancelled");
  }

  await prisma.credit.delete({ where: { id: creditId } });
  revalidatePath("/credits");
}

export async function recordPaymentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const creditId       = formData.get("creditId")?.toString();
  const amountStr      = formData.get("amount")?.toString()?.trim();
  const paymentMethod  = formData.get("paymentMethod")?.toString() || "mpesa";
  const transactionRef = formData.get("transactionRef")?.toString()?.trim() || null;
  const notes          = formData.get("notes")?.toString()?.trim() || null;

  if (!creditId || !amountStr) {
    return { error: "Credit ID and payment amount are required." };
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.creditPayment.create({
        data: {
          creditId,
          amount,
          paymentMethod,
          transactionRef,
          notes,
        },
      });

      const credit = await tx.credit.findUnique({
        where: { id: creditId },
        select: { totalAmount: true, paidAmount: true },
      });

      if (!credit) throw new Error("Credit record not found");

      const newPaid    = credit.paidAmount + amount;
      const newBalance = credit.totalAmount - newPaid;

      let newStatus: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
      if (newBalance === 0) newStatus = "PAID";
      else if (newPaid > 0) newStatus = "PARTIAL";

      await tx.credit.update({
        where: { id: creditId },
        data: {
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
          lastPaidAt: new Date(),
          lastPaymentMethod: paymentMethod,
        },
      });
    });

    revalidatePath("/credits");
    return { success: true };
  } catch (error) {
    console.error("Record payment error:", error);
    return { error: "Failed to record payment. Please try again." };
  }
}
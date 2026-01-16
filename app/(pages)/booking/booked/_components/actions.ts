// app/bookings/actions.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveBookingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId;

  const bookingId       = formData.get("bookingId")?.toString() || null;
  const patientId       = formData.get("patientId")?.toString() || "";
  const consultationFee = Number(formData.get("consultationFee")?.toString() || "0");
  const paymentMethod   = formData.get("paymentMethod")?.toString() || "mpesa";
  const attended        = formData.get("attended")?.toString() || "waiting"; // waiting / yes

  if (!patientId || consultationFee <= 0) {
    return { error: "Patient and valid consultation fee are required." };
  }

  try {
    if (bookingId) {
      // Update
      const existing = await prisma.book.findUnique({
        where: { id: bookingId },
        select: { hospitalId: true },
      });

      if (!existing || existing.hospitalId !== hospitalId) {
        return { error: "Cannot edit booking from another hospital." };
      }

      await prisma.book.update({
        where: { id: bookingId },
        data: {
          consultationFee,
          paymentMethod,
          attended,
        },
      });
    } else {
      // Create
      await prisma.book.create({
        data: {
          patientId,
          hospitalId,
          consultationFee,
          paymentMethod,
          attended,
        },
      });
    }

    revalidatePath("/bookings");
    return { success: true };
  } catch (err) {
    console.error("Save booking error:", err);
    return { error: bookingId ? "Failed to update booking." : "Failed to create booking." };
  }
}

export async function deleteBookingAction(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const hospitalId = profile.stationId;

  const booking = await prisma.book.findUnique({
    where: { id: bookingId },
    select: { hospitalId: true },
  });

  if (!booking || booking.hospitalId !== hospitalId) {
    throw new Error("Can only delete your hospital's bookings.");
  }

  await prisma.book.delete({ where: { id: bookingId } });
  revalidatePath("/bookings");
}
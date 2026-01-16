// app/bookings/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import BookingsClient from "./_components/BookingsClient";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="min-h-screen grid place-items-center text-xl text-gray-700">Please sign in</div>;
  }

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    return <div className="min-h-screen grid place-items-center text-red-600">No hospital station assigned</div>;
  }

  const hospitalId = profile.stationId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [hospital, waitingBookings, allTodayBookings, patients] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),

    // 1. Waiting patients – shown in the table
    prisma.book.findMany({
      where: {
        hospitalId,
        createdAt: { gte: today, lt: tomorrow },
        attended: "waiting",
      },
      select: {
        id: true,
        consultationFee: true,
        attended: true,
        patient: {
          select: { fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // 2. All bookings today – used only for totals
    prisma.book.findMany({
      where: {
        hospitalId,
        createdAt: { gte: today, lt: tomorrow },
      },
      select: {
        consultationFee: true,
      },
    }),

    prisma.patient.findMany({
      where: { hospitalId },
      select: {
        id: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const formattedWaitingBookings = waitingBookings.map((b) => ({
    ...b,
    patient: b.patient ?? { fullName: "Unknown Patient" },
  }));

  // Totals based on ALL bookings today (not just waiting)
  const totalBookingsToday = allTodayBookings.length;
  const totalFeesToday = allTodayBookings.reduce((sum, b) => sum + (b.consultationFee || 0), 0);

  return (
    <BookingsClient
      totalBookingsToday={totalBookingsToday}
      totalFeesToday={totalFeesToday}
      initialBookings={formattedWaitingBookings}           // only waiting shown in table
      hospitalName={hospital?.name || "Your Hospital"}
      patients={patients}
    />
  );
}
// app/attend/page.tsx (minor update: no major changes, but ensuring availableLabs is passed)

import prisma from "@/lib/prisma";
import WaitingList from "./_components/WaitingList";

export default async function AttendPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Today's served patients
  const todayServed = await prisma.book.findMany({
    where: {
      attended: "attended",
      updatedAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: {
      bill: true,
    },
  });

  const patientCountToday = todayServed.length;
  const totalRevenueToday = todayServed.reduce((sum, r) => sum + (r.bill ?? 0), 0);

  // Waiting patients
  const waitingPatients = await prisma.book.findMany({
    where: { attended: "waiting" },
    select: {
      id: true,
      createdAt: true,
      patient: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all available lab tests
  const availableLabs = await prisma.labs.findMany({
    select: {
      id: true,
      name: true,
      charges: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Patient Attendance</h1>

      <div className="bg-white shadow rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Todays Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-green-700">
              {patientCountToday}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Patients Served Today
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <div className="text-3xl font-bold text-blue-700">
              {totalRevenueToday.toLocaleString()} KSh
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Total Revenue Today
            </div>
          </div>
        </div>
      </div>

      <WaitingList 
        initialPatients={waitingPatients} 
        availableLabs={availableLabs}
      />
    </main>
  );
}
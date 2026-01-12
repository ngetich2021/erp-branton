import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ExpensesClient from "./_components/ExpensesClient";

export default async function ExpensesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view expenses.</p>
      </div>
    );
  }

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
          <p className="text-xl mb-4 text-red-800">No hospital assigned</p>
          <p className="text-gray-600">
            Please contact an administrator to assign you to a hospital station.
          </p>
        </div>
      </div>
    );
  }

  const hospitalId = profile.stationId;

  const [hospital, expenses] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.expense.findMany({
      where: { hospitalId },
      select: {
        id: true,
        transactionId: true,
        description: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <ExpensesClient
      totalExpenses={totalExpenses}
      initialExpenses={expenses}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
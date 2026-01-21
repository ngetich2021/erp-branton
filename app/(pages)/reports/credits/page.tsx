// app/reports/credits/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import CreditsClient from "./_components/CreditsClient";

export const revalidate = 1;

export default async function CreditsReportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view reports.</p>
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

  const [hospital, credits] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.credit.findMany({
      where: {
        book: {
          hospitalId,
        },
      },
      include: {
        book: {
          include: {
            patient: {
              select: {
                fullName: true,
                tel1: true,
                identity: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            transactionRef: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalCreditAmount = credits.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalBalance = credits.reduce((sum, c) => sum + c.balance, 0);

  return (
    <CreditsClient
      totalCreditAmount={totalCreditAmount}
      totalPaid={totalPaid}
      totalBalance={totalBalance}
      initialCredits={credits}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
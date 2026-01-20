import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import PaymentsClient from "./_components/PaymentsClient";

export const dynamic = "force-dynamic";

export default async function PaymentsReportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-gray-700">Please sign in to view reports.</p></div>;
  }

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { stationId: true } });
  if (!profile?.stationId) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-red-700">No hospital assigned.</p></div>;
  }

  const hospitalId = profile.stationId;

  const [hospital, payments] = await Promise.all([
    prisma.hospital.findUnique({ where: { id: hospitalId }, select: { name: true } }),
    prisma.creditPayment.findMany({
      where: { credit: { book: { hospitalId } } },
      include: {
        credit: {
          include: {
            book: {
              include: {
                patient: { select: { fullName: true, identity: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <PaymentsClient
      totalPayments={totalPayments}
      initialPayments={payments}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
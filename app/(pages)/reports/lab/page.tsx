import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import LabClient from "./_components/LabClient";

export const dynamic = "force-dynamic";

export default async function LabReportPage() {
  const session = await auth();
  if (!session?.user?.id) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-gray-700">Please sign in.</p></div>;

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { stationId: true } });
  if (!profile?.stationId) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-red-700">No hospital assigned.</p></div>;

  const hospitalId = profile.stationId;

  const [hospital, labOrders] = await Promise.all([
    prisma.hospital.findUnique({ where: { id: hospitalId }, select: { name: true } }),
    prisma.labOrder.findMany({
      where: { book: { hospitalId } },
      include: {
        lab: { select: { name: true, charges: true } },
        book: {
          include: {
            patient: { select: { fullName: true, identity: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const totalCharges = labOrders.reduce((sum, o) => sum + o.lab.charges, 0);

  return (
    <LabClient
      totalOrders={labOrders.length}
      totalCharges={totalCharges}
      initialLabOrders={labOrders}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
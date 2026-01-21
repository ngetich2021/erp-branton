
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SalesClient from "./_components/SalesClient";

export const revalidate = 1;

export default async function SalesReportPage() {
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
  const [hospital, sales] = await Promise.all([
    prisma.hospital.findUnique({ where: { id: hospitalId }, select: { name: true } }),
    prisma.sale.findMany({
      where: { pharmacy: { hospitalId } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <SalesClient
      totalSales={totalSales}
      initialSales={sales}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
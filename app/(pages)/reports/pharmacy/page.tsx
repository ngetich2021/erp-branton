import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import PharmacyClient from "./_components/PharmacyClient";

export default async function PharmacyReportPage() {
  const session = await auth();
  if (!session?.user?.id) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-gray-700">Please sign in.</p></div>;

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { stationId: true } });
  if (!profile?.stationId) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-red-700">No hospital assigned.</p></div>;

  const hospitalId = profile.stationId;

  const [hospital, pharmacy] = await Promise.all([
    prisma.hospital.findUnique({ where: { id: hospitalId }, select: { name: true } }),
    prisma.pharmacy.findUnique({
      where: { hospitalId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            cost: true,
            quantity: true,
            pic: true,
            expires: true,
            createdAt: true,
          },
          orderBy: { name: "asc" },
        },
      },
    }),
  ]);

  const products = pharmacy?.products ?? [];
  const totalValue = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);

  return (
    <PharmacyClient
      totalInventoryValue={totalValue}
      totalProducts={products.length}
      initialProducts={products}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
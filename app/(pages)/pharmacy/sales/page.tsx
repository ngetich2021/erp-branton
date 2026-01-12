import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SalesClient from "./_components/SalesClient";

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-10 text-center text-gray-600">Please sign in to view sales</div>;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    return <div className="p-10 text-red-600">No station assigned to your account</div>;
  }

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { hospitalId: profile.stationId },
    select: { id: true, name: true },
  });

  if (!pharmacy) {
    return <div className="p-10 text-red-600">No pharmacy found for your station</div>;
  }

  const sales = await prisma.sale.findMany({
    where: { pharmId: pharmacy.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      createdAt: true,
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <SalesClient
      pharmacyName={pharmacy.name ?? "Pharmacy"}
      totalSales={sales.reduce((sum, s) => sum + s.total, 0)}
      initialSales={sales.map((s) => ({
        id: s.id,
        total: s.total,
        createdAt: s.createdAt,
        itemCount: s._count.items,
      }))}
    />
  );
}
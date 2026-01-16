import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SalesClient from "./_components/SalesClient";

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view sales.</p>
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
          <p className="text-xl mb-4 text-red-800">No pharmacy assigned</p>
          <p className="text-gray-600">
            Please contact an administrator to assign you to a pharmacy station.
          </p>
        </div>
      </div>
    );
  }

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { hospitalId: profile.stationId },
    select: { id: true, name: true },
  });

  if (!pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
          <p className="text-xl mb-4 text-red-800">No pharmacy found</p>
          <p className="text-gray-600">
            Your station does not have an associated pharmacy.
          </p>
        </div>
      </div>
    );
  }

  const sales = await prisma.sale.findMany({
    where: { pharmId: pharmacy.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      createdAt: true,
      paymentMethod: true,
      _count: { select: { items: true } },
    },
  });

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  const initialSales = sales.map((s) => ({
    id: s.id,
    total: Number(s.total),
    createdAt: s.createdAt,
    itemCount: s._count.items,
    paymentMethod: s.paymentMethod as "mpesa" | "cash",
  }));

  return (
    <SalesClient
      totalSales={totalSales}
      initialSales={initialSales}
      pharmacyName={pharmacy.name || "Your Pharmacy"}
    />
  );
}
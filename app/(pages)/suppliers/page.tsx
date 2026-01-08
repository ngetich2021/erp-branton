import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import SuppliersClient from "./_components/SuppliersClient";

export default async function SuppliersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to access suppliers.</p>
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

  const [userHospital, suppliers] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.supplier.findMany({
      where: { hospitalId },
      select: {
        id: true,
        name: true,
        tel: true,
        description: true,
        createdAt: true,
        hospital: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedSuppliers = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    tel: s.tel,
    description: s.description,
    createdAt: s.createdAt.toISOString(),
    hospitalId,
    hospitalName: s.hospital.name,
  }));

  return (
    <SuppliersClient
      supplierCount={formattedSuppliers.length}
      initialSuppliers={formattedSuppliers}
      userHospitalName={userHospital?.name || "Your Hospital"}
    />
  );
}
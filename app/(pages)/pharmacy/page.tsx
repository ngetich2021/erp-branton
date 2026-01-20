import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import PharmaciesClient from "./_components/PharmaciesClient";

export const revalidate = 1;

export default async function PharmaciesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view pharmacies.</p>
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

  const [hospital, pharmacies] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.pharmacy.findMany({
      where: { hospitalId },
      select: {
        id: true,
        name: true,
        hospital: {
          select: { name: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <PharmaciesClient
      pharmacyCount={pharmacies.length}
      initialPharmacies={pharmacies}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
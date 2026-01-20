// app/reports/assets/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AssetsClient from "./_components/AssetsClient";

export const dynamic = "force-dynamic";

export default async function AssetsReportPage() {
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

  const [hospital, assets] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.asset.findMany({
      where: { hospitalId },
      select: {
        id: true,
        name: true,
        description: true,
        pic: true,
        value: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <AssetsClient
      totalValue={totalValue}
      initialAssets={assets}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
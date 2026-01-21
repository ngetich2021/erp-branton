import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import StaffClient from "./_components/StaffClient";

export const revalidate = 1;

export default async function StaffReportPage() {
  const session = await auth();
  if (!session?.user?.id) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-gray-700">Please sign in.</p></div>;

  const userId = session.user.id;
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { stationId: true } });
  if (!profile?.stationId) return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-red-700">No hospital assigned.</p></div>;

  const hospitalId = profile.stationId;

  const [hospital, staff] = await Promise.all([
    prisma.hospital.findUnique({ where: { id: hospitalId }, select: { name: true } }),
    prisma.profile.findMany({
      where: { stationId: hospitalId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <StaffClient
      totalStaff={staff.length}
      initialStaff={staff}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
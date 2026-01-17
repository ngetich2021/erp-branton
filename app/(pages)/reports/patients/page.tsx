import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import PatientsClient from "./_components/PatientsClient";

export default async function PatientsReportPage() {
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
        <p className="text-xl text-red-700">No hospital assigned.</p>
      </div>
    );
  }

  const hospitalId = profile.stationId;

  const [hospital, patients] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { name: true },
    }),
    prisma.patient.findMany({
      where: { hospitalId },
      select: {
        id: true,
        fullName: true,
        tel1: true,
        tel2: true,
        identity: true,
        dob: true,
        sex: true,
        location: true,
        medicalHistory: true,
        notes: true,
        refferedBy: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <PatientsClient
      totalPatients={patients.length}
      initialPatients={patients}
      userHospitalName={hospital?.name || "Your Hospital"}
    />
  );
}
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import HospitalClient from "./_components/HospitalClient";

export default async function HospitalReportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view reports.</p>
      </div>
    );
  }

  const hospitals = await prisma.hospital.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      registrationNo: true,
      incharge: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <HospitalClient
      hospitals={hospitals}
      totalHospitals={hospitals.length}
    />
  );
}
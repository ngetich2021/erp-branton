import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import LabsClient from "./_components/LabsClient";

export const revalidate = 1;

export default async function LabsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="min-h-screen grid place-items-center">Please sign in</div>;
  }

  // Optional: hospital check
  /*
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });
  if (!profile?.stationId) {
    return <div className="min-h-screen grid place-items-center">No hospital assigned</div>;
  }
  */

  const labs = await prisma.labs.findMany({
    select: {
      id: true,
      name: true,
      charges: true,
      createdAt: true,
    },
    orderBy: { name: "asc" }, // or createdAt: "desc"
  });

  const totalLabs = labs.length;

  return (
    <LabsClient
      totalLabs={totalLabs}
      initialLabs={labs}
      // userHospitalName={...}   // if needed
    />
  );
}
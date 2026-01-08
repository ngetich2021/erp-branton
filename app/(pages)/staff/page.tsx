// app/staff/page.tsx
import { getUsersRolesHospitals } from "./_components/actionsAddStaff";
import StaffClient from "./_components/StaffClient";
import prisma from "@/lib/prisma";

export default async function StaffPage() {
  const { users, roles, hospitals } = await getUsersRolesHospitals();

  const profiles = await prisma.profile.findMany({
    include: {
      user: {
        select: { email: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const initialStaff = profiles.map((p) => ({
    userId: p.userId,
    fullName: p.fullName,
    email: p.user.email,
    contact1: p.contact1,
    contact2: p.contact2,
    role: p.role,
    stationId: p.stationId,
  }));

  const initialStaffCount = initialStaff.length;

  return (
    <StaffClient
      initialUsers={users}
      initialRoles={roles}
      initialHospitals={hospitals}
      initialStaff={initialStaff}
      initialStaffCount={initialStaffCount}
    />
  );
}
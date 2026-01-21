import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import CreditsClient from "./_components/CreditsClient";

export const revalidate = 1;

interface PatientOption {
  value: string;          // book.id
  label: string;
  patientName: string;
  tel: string;
  identity: string;
}

interface EnrichedCredit {
  id: string;
  bookId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: Date;
  patientName: string;
  patientTel: string;
  patientIdentity: string;
}

export default async function CreditsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view credits.</p>
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

  const stationId = profile.stationId;

  const [hospital, rawCredits, rawBooks] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: stationId },
      select: { name: true },
    }),

    prisma.credit.findMany({
      where: {
        book: { hospitalId: stationId },
        balance: { gt: 0 },
      },
      select: {
        id: true,
        bookId: true,
        totalAmount: true,
        paidAmount: true,
        balance: true,
        status: true,
        createdAt: true,
        book: {
          select: {
            patient: {
              select: {
                fullName: true,
                tel1: true,
                identity: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.book.findMany({
      where: { hospitalId: stationId },
      select: {
        id: true,
        patient: {
          select: {
            fullName: true,
            tel1: true,
            identity: true,
          },
        },
      },
      orderBy: {
        patient: { fullName: "asc" },
      },
    }),
  ]);

  const totalOutstanding = rawCredits.reduce((sum, c) => sum + c.balance, 0);

  const availableBooks: PatientOption[] = rawBooks
    .filter((b): b is { id: string; patient: { fullName: string; tel1: string; identity: string } } => !!b.patient)
    .map((b) => {
      const p = b.patient;
      const name = p.fullName.trim() || "Unknown Patient";
      const tel = p.tel1.trim() || "No phone";
      const idDisplay = p.identity
        ? p.identity.slice(0, 10) + (p.identity.length > 10 ? "..." : "")
        : "No ID";

      return {
        value: b.id,
        label: `${name} • ${tel} • ${idDisplay}`,
        patientName: name,
        tel,
        identity: p.identity || "",
      };
    });

  const enrichedCredits: EnrichedCredit[] = rawCredits.map((c) => {
    const p = c.book?.patient;
    return {
      id: c.id,
      bookId: c.bookId,
      totalAmount: c.totalAmount,
      paidAmount: c.paidAmount,
      balance: c.balance,
      status: c.status,
      createdAt: c.createdAt,
      patientName: p?.fullName ?? "N/A",
      patientTel: p?.tel1 ?? "N/A",
      patientIdentity: p?.identity ?? "N/A",
    };
  });

  return (
    <CreditsClient
      totalOutstanding={totalOutstanding}
      initialCredits={enrichedCredits}
      userHospitalName={hospital?.name ?? "Your Hospital"}
      availableBooks={availableBooks}
    />
  );
}
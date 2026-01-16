// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashboardClient from "./_components/DashboardClient";
import prisma from "@/lib/prisma";

// ── Shared types (to avoid duplication and "cannot find name" errors) ──
export interface PieSegment {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

export interface DailyEntry {
  day: number;
  patients: number;
  revenue: number;
}

export interface KpiStats {
  hospitals: number;
  revenue: number;
  patients: number;
  services: number;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const now = new Date();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const currentMonth = new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
  }).format(now);

  // Get hospitals managed by this user
  const hospitals = await prisma.hospital.findMany({
    where: { userId },
    select: { id: true },
  });

  const hospitalIds = hospitals.map((h) => h.id);

  if (hospitalIds.length === 0) {
    return (
      <DashboardClient
        currentMonth={currentMonth}
        kpi={{ hospitals: 0, revenue: 0, patients: 0, services: 0 }}
        pieChart={[]}
        dailyActivity={[]}
      />
    );
  }

  // ── KPI data ───────────────────────────────────────────────────────────
  const [hospitalCount, patientCount, salesAgg, bookAgg, labCount] = await Promise.all([
    prisma.hospital.count({ where: { userId } }),

    prisma.patient.count({
      where: {
        hospitalId: { in: hospitalIds },
        createdAt: { gte: monthStart },
      },
    }),

    prisma.sale.aggregate({
      where: {
        pharmacy: { hospitalId: { in: hospitalIds } },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { total: true },
    }),

    prisma.book.aggregate({
      where: {
        hospitalId: { in: hospitalIds },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: {
        bill: true,
        consultationFee: true,
      },
      _count: { id: true },
    }),

    prisma.labOrder.count({
      where: {
        book: {
          hospitalId: { in: hospitalIds },
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      },
    }),
  ]);

  const revenue =
    (salesAgg._sum.total ?? 0) +
    (bookAgg._sum.bill ?? 0) +
    (bookAgg._sum.consultationFee ?? 0);

  const services = (bookAgg._count.id ?? 0) + labCount;

  const kpi: KpiStats = {
    hospitals: hospitalCount,
    revenue,
    patients: patientCount,
    services,
  };

  // ── Daily activity data ───────────────────────────────────────────────
  const dailyBookings = await prisma.book.groupBy({
    by: ["createdAt"],
    where: {
      hospitalId: { in: hospitalIds },
      createdAt: { gte: monthStart, lt: monthEnd },
    },
    _count: { id: true },
    _sum: {
      bill: true,
      consultationFee: true,
    },
  });

  const dailySales = await prisma.sale.groupBy({
    by: ["createdAt"],
    where: {
      pharmacy: { hospitalId: { in: hospitalIds } },
      createdAt: { gte: monthStart, lt: monthEnd },
    },
    _count: { id: true },
    _sum: { total: true },
  });

  const dailyMap = new Map<string, { patients: number; revenue: number }>();

  dailyBookings.forEach((group) => {
    if (group.createdAt) {
      const key = group.createdAt.toISOString().split("T")[0];
      const entry = dailyMap.get(key) ?? { patients: 0, revenue: 0 };
      entry.patients += group._count.id;
      entry.revenue += (group._sum.bill ?? 0) + (group._sum.consultationFee ?? 0);
      dailyMap.set(key, entry);
    }
  });

  dailySales.forEach((group) => {
    if (group.createdAt) {
      const key = group.createdAt.toISOString().split("T")[0];
      const entry = dailyMap.get(key) ?? { patients: 0, revenue: 0 };
      entry.patients += group._count.id;
      entry.revenue += group._sum.total ?? 0;
      dailyMap.set(key, entry);
    }
  });

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const dailyActivity: DailyEntry[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateKey = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split("T")[0];
    const data = dailyMap.get(dateKey) ?? { patients: 0, revenue: 0 };
    return {
      day,
      patients: data.patients,
      revenue: data.revenue,
    };
  });

  // ── Pie chart data (4 roughly equal periods) ──────────────────────────
  const pieChart: PieSegment[] = [
    { name: "Days 1–7",   value: 0, color: "#16a34a" },
    { name: "Days 8–14",  value: 0, color: "#22c55e" },
    { name: "Days 15–21", value: 0, color: "#86efac" },
    { name: "Days 22–end",value: 0, color: "#22d3ee" },
  ];

  dailyActivity.forEach((entry) => {
    if (entry.day <= 7)      pieChart[0].value += entry.revenue;
    else if (entry.day <= 14) pieChart[1].value += entry.revenue;
    else if (entry.day <= 21) pieChart[2].value += entry.revenue;
    else                      pieChart[3].value += entry.revenue;
  });

  return (
    <DashboardClient
      currentMonth={currentMonth}
      kpi={kpi}
      pieChart={pieChart}
      dailyActivity={dailyActivity}
    />
  );
}
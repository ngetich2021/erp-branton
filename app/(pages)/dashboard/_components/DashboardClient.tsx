// components/DashboardClient.tsx
"use client";

import {
  Bar,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  TooltipProps,
  PieLabelRenderProps,
} from "recharts";
import {
  TrendingUp,
  Hospital,
  DollarSign,
  Users,
  Activity,
} from "lucide-react";

import type { DailyEntry, KpiStats, PieSegment } from "../page";

interface DashboardClientProps {
  currentMonth: string;
  kpi: KpiStats;
  pieChart: PieSegment[];
  dailyActivity: DailyEntry[];
}

export default function DashboardClient({
  currentMonth,
  kpi,
  pieChart,
  dailyActivity,
}: DashboardClientProps) {
  const totalRevenue = pieChart.reduce((sum, segment) => sum + segment.value, 0);

  const tooltipFormatter: TooltipProps<number | string, string>["formatter"] = (
    value,
    name,
  ) => {
    const displayName = String(name ?? "Unknown");

    if (typeof value !== "number") {
      return [String(value), displayName];
    }

    if (displayName === "Revenue Trend") {
      return [`KES ${value.toLocaleString("en-KE")}`, displayName];
    }

    return [`${value.toLocaleString("en-KE")} patients/services`, displayName];
  };

  const pieLabel = (props: PieLabelRenderProps): string => {
    const { percent } = props;
    if (percent == null || isNaN(percent)) return "";
    return `${Math.round(percent * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50/70 p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Hospital Overview — {currentMonth}
          </h1>
          <div className="text-sm text-gray-500">
            Updated: {new Date().toLocaleDateString("en-KE")}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Hospitals"
            value={kpi.hospitals.toLocaleString("en-KE")}
            icon={<Hospital className="h-7 w-7 text-blue-600" />}
            bg="bg-blue-50"
          />
          <StatCard
            title="Total Revenue"
            value={`KES ${kpi.revenue.toLocaleString("en-KE")}`}
            icon={<DollarSign className="h-7 w-7 text-green-600" />}
            bg="bg-green-50"
          />
          <StatCard
            title="Total Patients"
            value={kpi.patients.toLocaleString("en-KE")}
            icon={<Users className="h-7 w-7 text-purple-600" />}
            bg="bg-purple-50"
          />
          <StatCard
            title="Total Services"
            value={kpi.services.toLocaleString("en-KE")}
            icon={<Activity className="h-7 w-7 text-amber-600" />}
            bg="bg-amber-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Monthly Revenue Distribution
              </h3>
              <span className="text-sm text-gray-500">
                KES {totalRevenue.toLocaleString("en-KE")}
              </span>
            </div>

            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    label={pieLabel}
                    labelLine={false}
                  >
                    {pieChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {pieChart.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Daily Business Activity & Growth
              </h3>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="h-[18rem]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyActivity}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Bar
                    yAxisId="left"
                    dataKey="patients"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Patients / Services"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Revenue Trend"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Bars = daily patients / services • Line = revenue trend (KES)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg?: string;
}

function StatCard({ title, value, icon, bg = "bg-gray-50" }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-gray-200 shadow-sm p-5 ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1.5 text-2xl md:text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        <div className="rounded-full bg-white/80 p-3 shadow-sm">{icon}</div>
      </div>
    </div>
  );
}
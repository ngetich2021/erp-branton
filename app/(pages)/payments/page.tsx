// app/payments/page.tsx   ← make sure the file ends with .tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import type { ReactNode } from "react";

type Tab = "all" | "consultation" | "labs" | "pharmacy";

interface PaymentsPageProps {
  searchParams: Promise<{ tab?: string }>;  // ← important: Promise type
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  // Await it here – this is the fix
  const resolvedSearchParams = await searchParams;

  const activeTab: Tab =
    resolvedSearchParams.tab === "consultation" ||
    resolvedSearchParams.tab === "labs" ||
    resolvedSearchParams.tab === "pharmacy"
      ? resolvedSearchParams.tab
      : "all";

  const pharmacySales = await prisma.sale.findMany({
    take: 60,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      paymentMethod: true,
      createdAt: true,
      pharmacy: {
        select: {
          hospital: {
            select: { name: true },
          },
        },
      },
    },
  });

  const bookings = await prisma.book.findMany({
    where: {
      OR: [
        { consultationFee: { gt: 0 } },
        { bill: { not: null } },
        { labOrders: { some: {} } },
      ],
    },
    take: 60,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      consultationFee: true,
      bill: true,
      paymentMethod: true,
      createdAt: true,
      patient: { select: { fullName: true } },
      hospital: { select: { name: true } },
      labOrders: {
        select: {
          lab: {
            select: { charges: true },
          },
        },
      },
    },
  });

  const getLabTotal = (props: (typeof bookings)[number]): number =>
    props.labOrders.reduce((acc, order) => acc + (order.lab?.charges ?? 0), 0);

  const pharmacyTotal     = pharmacySales.reduce((acc, s) => acc + s.total, 0);
  const consultationTotal = bookings.reduce((acc, b) => acc + (b.consultationFee ?? 0), 0);
  const billTotal         = bookings.reduce((acc, b) => acc + (b.bill ?? 0), 0);
  const labTotal          = bookings.reduce((acc, b) => acc + getLabTotal(b), 0);
  const grandTotal        = pharmacyTotal + consultationTotal + billTotal + labTotal;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payments Overview</h1>
          <p className="mt-2 text-gray-600">
            Summary of money received: consultations, doctor fees, labs & pharmacy
          </p>
        </div>

        <nav className="mb-10 border-b border-gray-200">
          <div className="flex flex-wrap gap-x-10 gap-y-2 -mb-px">
            {(["all", "consultation", "labs", "pharmacy"] as const).map((tab) => (
              <Link
                key={tab}
                href={`?tab=${tab}`}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab === "all" ? "All Transactions"
                  : tab === "consultation" ? "Consult + Doctor"
                  : tab === "labs" ? "Laboratory"
                  : "Pharmacy Sales"}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Pharmacy"      value={pharmacyTotal}     color="blue" />
          <SummaryCard label="Consultation"  value={consultationTotal} color="emerald" />
          <SummaryCard label="Doctor / Bill" value={billTotal}         color="purple" />
          <SummaryCard label="Laboratory"    value={labTotal}          color="amber" />
          <SummaryCard label="Grand Total"   value={grandTotal}        color="indigo" highlight />
        </div>

        {(activeTab === "all" || activeTab === "pharmacy") && (
          <DataSection title="Pharmacy Sales">
            <GenericTable
              rows={pharmacySales}
              columns={[
                { header: "Date",     getValue: (props) => new Date(props.createdAt).toLocaleDateString("en-KE") },
                { header: "Hospital", getValue: (props) => props.pharmacy?.hospital?.name ?? "—" },
                { header: "Method",   getValue: (props) => props.paymentMethod ?? "—" },
                { header: "Amount",   getValue: (props) => props.total.toLocaleString(), alignRight: true, bold: true },
              ]}
            />
          </DataSection>
        )}

        {(activeTab === "all" || activeTab === "consultation") && (
          <DataSection title="Consultation & Doctor Fees">
            <GenericTable
              rows={bookings}
              columns={[
                { header: "Date",        getValue: (props) => new Date(props.createdAt).toLocaleDateString("en-KE") },
                { header: "Patient",     getValue: (props) => props.patient?.fullName ?? "—" },
                { header: "Hospital",    getValue: (props) => props.hospital?.name ?? "—" },
                { header: "Consult Fee", getValue: (props) => (props.consultationFee ?? 0).toLocaleString() },
                { header: "Bill/Dr Fee", getValue: (props) => (props.bill ?? 0).toLocaleString() },
                {
                  header: "Subtotal",
                  getValue: (props) => ((props.consultationFee ?? 0) + (props.bill ?? 0)).toLocaleString(),
                  alignRight: true,
                  bold: true,
                },
              ]}
            />
          </DataSection>
        )}

        {(activeTab === "all" || activeTab === "labs") && (
          <DataSection title="Laboratory Payments">
            <GenericTable
              rows={bookings.filter((props) => getLabTotal(props) > 0)}
              columns={[
                { header: "Date",      getValue: (props) => new Date(props.createdAt).toLocaleDateString("en-KE") },
                { header: "Patient",   getValue: (props) => props.patient?.fullName ?? "—" },
                { header: "Hospital",  getValue: (props) => props.hospital?.name ?? "—" },
                { header: "Lab Total", getValue: (props) => getLabTotal(props).toLocaleString(), alignRight: true, bold: true },
              ]}
            />
          </DataSection>
        )}
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────
// Reusable components (unchanged)
// ────────────────────────────────────────────────

type Color = "blue" | "emerald" | "purple" | "amber" | "indigo";

function SummaryCard({
  label,
  value,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  color: Color;
  highlight?: boolean;
}) {
  const style = {
    blue:    "bg-blue-50 border-blue-100 text-blue-800",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
    purple:  "bg-purple-50 border-purple-100 text-purple-800",
    amber:   "bg-amber-50 border-amber-100 text-amber-800",
    indigo:  "bg-indigo-50 border-indigo-100 text-indigo-800",
  }[color];

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${style} ${
        highlight ? "ring-2 ring-indigo-300 ring-offset-2" : ""
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-2xl font-bold">
        {value.toLocaleString()}
        <span className="ml-1 text-lg font-normal"> KSh</span>
      </p>
    </div>
  );
}

function DataSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="mb-5 text-xl font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

interface Column<T> {
  header: string;
  getValue: (props: T) => string;
  alignRight?: boolean;
  bold?: boolean;
}

function GenericTable<T>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-gray-500">No records found</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-6 py-3.5 text-left text-sm font-semibold text-gray-700 ${
                  col.alignRight ? "text-right" : ""
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((props, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${
                    col.alignRight ? "text-right" : ""
                  } ${col.bold ? "font-medium" : ""}`}
                >
                  {col.getValue(props)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
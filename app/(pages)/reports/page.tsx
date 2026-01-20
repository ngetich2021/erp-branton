// app/reports/page.tsx
"use server";

import { auth } from "@/auth";
import Link from "next/link";

export const revalidate = 1;

export default async function ReportsDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-xl text-gray-700">Please sign in to view reports.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Hey Manager, which type of report do you want us to generate?</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-4 border-purple-500 p-4 rounded-lg">
          <Link href="/reports/sales"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">SALES REPORTS</div></Link>
          <Link href="/reports/assets"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">assets REPORTS</div></Link>
          <Link href="/reports/payments"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">payment REPORTS</div></Link>
          <Link href="/reports/credits"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">credit REPORTS</div></Link>
          <Link href="/reports/patients"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">patients REPORTS</div></Link>
          <Link href="/reports/staff"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">staff REPORTS</div></Link>
          <Link href="/reports/expenses"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">expenses REPORTS</div></Link>
          <Link href="/reports/pharmacy"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">pharmacy REPORTS</div></Link>
          <Link href="/reports/hospital"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">hospital REPORTS</div></Link>
          <Link href="/reports/lab"><div className="bg-purple-200 p-6 rounded-lg text-center font-bold text-lg border border-purple-300">lab REPORTS</div></Link>
        </div>
      </div>
    </div>
  );
}
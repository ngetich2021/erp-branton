"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import LabOrderViewModal from "./LabOrderViewModal";

interface LabOrder {
  id: string;
  createdAt: Date;
  lab: { name: string; charges: number };
  book: {
    id: string;
    patient: { fullName: string; identity: string };
  };
}

interface Props {
  totalOrders: number;
  totalCharges: number;
  initialLabOrders: LabOrder[];
  userHospitalName: string;
}

export default function LabClient({ totalOrders, totalCharges, initialLabOrders, userHospitalName }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<LabOrder | undefined>();

  const filtered = initialLabOrders.filter(o =>
    o.lab.name.toLowerCase().includes(search.toLowerCase()) ||
    o.book.patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
    o.book.patient.identity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">Lab Reports – {userHospitalName}</h1>
            <div className="mt-2 space-y-1">
              <p className="text-lg">Total Tests: <span className="text-purple-600 font-bold">{totalOrders}</span></p>
              <p className="text-2xl">Total Charges: <span className="text-purple-600 font-bold">KES {totalCharges.toLocaleString()}</span></p>
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-3 rounded-lg">Print Report</button>
        </div>

        <input type="text" placeholder="Search by patient, ID or test name..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">ID Number</th>
                <th className="px-6 py-3 text-left">Test</th>
                <th className="px-6 py-3 text-left">Charges (KES)</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-gray-500">No lab orders found</td></tr> : (
                filtered.map((o, i) => (
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(o); setIsOpen(true); }}>
                    <td className="px-6 py-4">{i+1}</td>
                    <td className="px-6 py-4">{o.book.patient.fullName}</td>
                    <td className="px-6 py-4">{o.book.patient.identity}</td>
                    <td className="px-6 py-4 font-medium">{o.lab.name}</td>
                    <td className="px-6 py-4">KES {o.lab.charges.toLocaleString()}</td>
                    <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between">
              <h2 className="text-xl font-bold">Lab Order Details</h2>
              <button onClick={() => setIsOpen(false)} className="text-3xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <LabOrderViewModal order={selected} onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
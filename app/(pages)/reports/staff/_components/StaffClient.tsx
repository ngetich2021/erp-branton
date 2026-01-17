"use client";

import { useState } from "react";
import StaffViewModal from "./StaffViewModal";

interface Staff {
  userId: string;
  fullName: string | null;
  designation: string | null;
  role: string;
  contact1: string | null;
  contact2: string | null;
  email: string | null;
  user: { name: string | null; email: string | null };
}

interface Props {
  totalStaff: number;
  initialStaff: Staff[];
  userHospitalName: string;
}

export default function StaffClient({ totalStaff, initialStaff, userHospitalName }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | undefined>();

  const filtered = initialStaff.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.designation || "").toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">Staff Reports – {userHospitalName}</h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">Total Staff: {totalStaff}</p>
          </div>
          <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-3 rounded-lg">Print List</button>
        </div>

        <input type="text" placeholder="Search by name, role or designation..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Designation</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-gray-500">No staff found</td></tr> : (
                filtered.map((s, i) => (
                  <tr key={s.userId} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(s); setIsOpen(true); }}>
                    <td className="px-6 py-4">{i+1}</td>
                    <td className="px-6 py-4 font-medium">{s.fullName || s.user.name || "—"}</td>
                    <td className="px-6 py-4">{s.role}</td>
                    <td className="px-6 py-4">{s.designation || "—"}</td>
                    <td className="px-6 py-4">{s.contact1 || "—"}</td>
                    <td className="px-6 py-4">{s.user.email || s.email || "—"}</td>
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
              <h2 className="text-xl font-bold">Staff Member Details</h2>
              <button onClick={() => setIsOpen(false)} className="text-3xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <StaffViewModal staff={selected} onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
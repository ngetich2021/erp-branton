// app/attend/_components/WaitingList.tsx (minor update: no major changes)

"use client";

import { useState } from "react";
import AttendSidebar from "./AttendSidebar";

type WaitingPatient = {
  id: string;
  createdAt: Date;
  patient: { fullName: string };
};

type Lab = {
  id: string;
  name: string;
  charges: number;
};

type Props = {
  initialPatients: WaitingPatient[];
  availableLabs: Lab[];
};

export default function WaitingList({ initialPatients, availableLabs }: Props) {
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null);

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Patient</th>
              <th className="px-6 py-3 text-left">Waiting Since</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {initialPatients.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{p.patient.fullName}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedPatient(p)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
                  >
                    Attend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <AttendSidebar
          patient={selectedPatient}
          availableLabs={availableLabs}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </>
  );
}
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import HospitalViewModal from "./HospitalViewModal";

interface Hospital {
  id: string;
  name: string;
  location: string;
  registrationNo: string;
  incharge: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  hospitals: Hospital[];
  totalHospitals: number;
}

export default function HospitalClient({ hospitals, totalHospitals }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | undefined>();

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase()) ||
    h.registrationNo.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedHospital(undefined);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Hospitals Overview
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              Total Hospitals: {totalHospitals.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Print List
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, location or registration number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Registration No</th>
                <th className="px-6 py-3 text-left">Incharge</th>
                <th className="px-6 py-3 text-left">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHospitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No hospitals found
                  </td>
                </tr>
              ) : (
                filteredHospitals.map((h, index) => (
                  <tr
                    key={h.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(h)}
                  >
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{h.name}</td>
                    <td className="px-6 py-4 text-sm">{h.location}</td>
                    <td className="px-6 py-4 text-sm">{h.registrationNo}</td>
                    <td className="px-6 py-4 text-sm">{h.incharge || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(h.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedHospital.name}</h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <HospitalViewModal
                hospital={selectedHospital}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
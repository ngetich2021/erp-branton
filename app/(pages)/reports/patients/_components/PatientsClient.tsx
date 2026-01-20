"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import PatientViewModal from "./PatientViewModal";

interface Patient {
  id: string;
  fullName: string;
  tel1: string;
  tel2: string | null;
  identity: string;
  dob: string;
  sex: string;
  location: string;
  medicalHistory: string | null;
  notes: string | null;
  refferedBy: string | null;
  createdAt: Date;
}

interface Props {
  totalPatients: number;
  initialPatients: Patient[];
  userHospitalName: string;
}

export default function PatientsClient({
  totalPatients,
  initialPatients,
  userHospitalName,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();

  const filteredPatients = initialPatients.filter((p) =>
    [p.fullName, p.identity, p.tel1, p.location]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPatient(undefined);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Patients Reports – {userHospitalName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              Total Patients: {totalPatients.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Print List
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name, ID, phone or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left">ID Number</th>
                <th className="px-4 sm:px-6 py-3 text-left">Phone</th>
                <th className="px-4 sm:px-6 py-3 text-left">Sex</th>
                <th className="px-4 sm:px-6 py-3 text-left">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(patient)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium">{patient.fullName}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{patient.identity}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{patient.tel1}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{patient.sex}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{patient.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Patient Details</h2>
              <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <PatientViewModal patient={selectedPatient} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
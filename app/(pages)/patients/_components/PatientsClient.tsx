"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { deletePatientAction } from "./actionsPatient";
import PatientFormModal from "./AddPatients";

interface Patient {
  id: string;
  fullName: string;
  tel1: string;
  tel2: string | null;
  location: string;
  createdAt: string;
  email: string | null;
  identity: string;
  dob: string;
  sex: string;
  medicalHistory: string | null;
  notes: string | null;
  refferedBy: string | null;
}

interface PatientsClientProps {
  patientCount: number;
  initialPatients: Patient[];
}

export default function PatientsClient({
  patientCount,
  initialPatients,
}: PatientsClientProps) {
  const [patients, setPatients] = useState(initialPatients);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (mode: "add" | "edit" | "view", patient?: Patient) => {
    setModalMode(mode);
    setSelectedPatient(patient || null);
    setIsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPatient(null);
  };

  const handleSuccess = () => {
    closeModal();
    // Optionally refetch patients here if needed
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePatientAction(patientId);
      setPatients(patients.filter(p => p.id !== patientId));
    } catch (error) {
      console.log(error)
      alert("Failed to delete patient.");
    }
    setOpenDropdownId(null);
  };

  const toggleDropdown = (patientId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownId === patientId) {
      setOpenDropdownId(null);
      return;
    }

    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    if (spaceBelow < 120 && buttonRect.top > 120) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }

    setOpenDropdownId(patientId);
  };

  const filteredPatients = patients.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.tel1.includes(search) ||
    (p.tel2 && p.tel2.includes(search)) ||
    p.location.toLowerCase().includes(search)
  );

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="bg-white rounded-xl px-8 py-6 shadow">
            <h2 className="text-3xl font-bold text-gray-800">Patients</h2>
            <p className="text-4xl font-mono text-blue-600 mt-2">
              {filteredPatients.length}
              {filteredPatients.length !== patientCount && (
                <span className="text-xl text-gray-500"> / {patientCount}</span>
              )}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow transition"
          >
            + Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Table */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-xl text-gray-500">No patients found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Reg. Date</th>
                    <th className="px-6 py-3">Full Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openModal("view", patient)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900" onClick={(e) => e.stopPropagation()}>
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(patient.createdAt)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{patient.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{patient.tel1}</div>
                        {patient.tel2 && <div className="text-sm text-gray-500">{patient.tel2}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{patient.location}</td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            ref={buttonRef}
                            onClick={(e) => toggleDropdown(patient.id, e)}
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {openDropdownId === patient.id && (
                            <div
                              ref={dropdownRef}
                              className={`absolute right-0 z-10 w-32 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${
                                dropdownPosition === "top" ? "bottom-full mb-2" : "mt-2"
                              }`}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => openModal("edit", patient)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(patient.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div className="fixed top-20 right-0 h-[calc(100vh-5rem)] w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-500 translate-x-0">
            <button
              onClick={closeModal}
              className="absolute top-6 left-6 text-4xl text-gray-600 hover:text-gray-900"
            >
              ×
            </button>
            <div className="p-8 pt-20">
              <PatientFormModal
                mode={modalMode}
                patient={selectedPatient || undefined}
                onSuccess={handleSuccess}
                onClose={closeModal}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
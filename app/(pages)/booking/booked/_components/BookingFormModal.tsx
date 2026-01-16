// app/bookings/_components/BookingFormModal.tsx
"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { saveBookingAction } from "./actions";

interface PatientOption {
  id: string;
  fullName: string;
  identity?: string | null;
  tel1?: string | null;
}

interface InitialBooking {
  id?: string;
  consultationFee: number;
  attended: string | null;
  patient: { fullName: string };
}

interface ActionState {
  success?: boolean;
  error?: string;
}

interface Props {
  mode: "add" | "view";
  initialBooking?: InitialBooking;
  patients: PatientOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingFormModal({
  mode,
  initialBooking,
  patients,
  onClose,
  onSuccess,
}: Props) {
  const isView = mode === "view";

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await saveBookingAction(formData);
      if (result.success) onSuccess();
      return result;
    },
    { success: false }
  );

  // ── Patient search ───────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.identity && p.identity.toLowerCase().includes(term)) ||
      (p.tel1 && p.tel1.toLowerCase().includes(term))
    );
  });

  const handleSelectPatient = (patient: PatientOption) => {
    setSelectedPatientId(patient.id);
    setSearchTerm(patient.fullName);
    setShowDropdown(false);
  };

  // ── Form submit prep ─────────────────────────────────────────────────────
  // We'll use a hidden input for patientId
  // or we can use formData.append in onSubmit, but hidden input is simpler

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "add" ? "Book New Patient" : "Booking Details"}
        </h2>
        <button
          onClick={onClose}
          className="text-3xl text-gray-500 hover:text-gray-700 leading-none"
        >
          ×
        </button>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {initialBooking?.id && (
          <input type="hidden" name="bookingId" value={initialBooking.id} />
        )}

        {/* Hidden field for selected patient ID */}
        <input type="hidden" name="patientId" value={selectedPatientId} />

        <div ref={wrapperRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient <span className="text-red-600">*</span>
          </label>

          {isView ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800">
              {initialBooking?.patient.fullName || "—"}
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  // Reset selection if user types manually
                  if (e.target.value !== patients.find(p => p.id === selectedPatientId)?.fullName) {
                    setSelectedPatientId("");
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name, ID or phone..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />

              {showDropdown && filteredPatients.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredPatients.map((patient) => (
                    <li
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer"
                    >
                      <div className="font-medium">{patient.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {patient.identity && `ID: ${patient.identity} • `}
                        {patient.tel1 && `Tel: ${patient.tel1}`}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {showDropdown && filteredPatients.length === 0 && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-gray-500 text-sm">
                  No matching patients found
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consultation Fee (KES) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            name="consultationFee"
            required
            min="0"
            step="1"
            defaultValue={initialBooking?.consultationFee ?? ""}
            readOnly={isView}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select
            name="paymentMethod"
            defaultValue="mpesa"
            disabled={isView}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-600"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition"
          >
            Cancel
          </button>

          {!isView && (
            <button
              type="submit"
              disabled={pending || !selectedPatientId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {pending ? "Saving..." : "+ Book Patient"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
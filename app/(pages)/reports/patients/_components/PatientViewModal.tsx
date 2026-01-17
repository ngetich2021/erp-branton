"use client";

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
  patient: Patient;
  onClose: () => void;
}

export default function PatientViewModal({ patient, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Patient Profile</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Full Name</label>
          <input value={patient.fullName} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">ID Number</label>
          <input value={patient.identity} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Phone 1</label>
          <input value={patient.tel1} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Phone 2</label>
          <input value={patient.tel2 || "-"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Sex</label>
          <input value={patient.sex} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Date of Birth</label>
          <input value={patient.dob} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Location</label>
          <input value={patient.location} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      {patient.refferedBy && (
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Referred By</label>
          <input value={patient.refferedBy} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Medical History</label>
        <textarea
          value={patient.medicalHistory || "No history recorded"}
          readOnly
          rows={5}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Additional Notes</label>
        <textarea
          value={patient.notes || "No notes"}
          readOnly
          rows={4}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Registered On</label>
        <input
          value={new Date(patient.createdAt).toLocaleString()}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition"
        >
          Print Profile
        </button>
      </div>
    </div>
  );
}
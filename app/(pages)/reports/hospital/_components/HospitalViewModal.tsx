"use client";

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
  hospital: Hospital;
  onClose: () => void;
}

export default function HospitalViewModal({ hospital, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          Hospital Details
        </h3>
        <p className="text-xl text-purple-700 mt-2 font-semibold">
          {hospital.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Registration Number
          </label>
          <input
            value={hospital.registrationNo}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Incharge / Administrator
          </label>
          <input
            value={hospital.incharge || "Not specified"}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Location / Address
        </label>
        <textarea
          value={hospital.location}
          readOnly
          rows={3}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Internal ID
          </label>
          <input
            value={hospital.id}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Registered On
          </label>
          <input
            value={new Date(hospital.createdAt).toLocaleDateString("en-GB")}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Last Updated
          </label>
          <input
            value={new Date(hospital.updatedAt).toLocaleDateString("en-GB")}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>
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
          Print
        </button>
      </div>
    </div>
  );
}
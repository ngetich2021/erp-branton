"use client";

interface Staff {
  fullName: string | null;
  designation: string | null;
  role: string;
  contact1: string | null;
  contact2: string | null;
  email: string | null;
  user: { name: string | null; email: string | null };
}

interface Props {
  staff: Staff;
  onClose: () => void;
}

export default function StaffViewModal({ staff, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Staff Profile</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Full Name</label>
          <input value={staff.fullName || staff.user.name || "—"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Role</label>
          <input value={staff.role} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Designation</label>
        <input value={staff.designation || "Not specified"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Primary Contact</label>
          <input value={staff.contact1 || "—"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Secondary Contact</label>
          <input value={staff.contact2 || "—"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Email</label>
        <input value={staff.user.email || staff.email || "—"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition">Close</button>
        <button onClick={handlePrint} className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition">Print</button>
      </div>
    </div>
  );
}
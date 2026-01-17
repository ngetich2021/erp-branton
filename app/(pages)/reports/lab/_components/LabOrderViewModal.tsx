"use client";

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
  order: LabOrder;
  onClose: () => void;
}

export default function LabOrderViewModal({ order, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Lab Test Order</h3>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Patient Name</label>
        <input value={order.book.patient.fullName} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">ID Number</label>
        <input value={order.book.patient.identity} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Booking / Visit ID</label>
        <input value={order.book.id} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Lab Test</label>
          <input value={order.lab.name} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Charges (KES)</label>
          <input value={order.lab.charges.toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 font-bold" />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Order Date</label>
        <input value={new Date(order.createdAt).toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition">Close</button>
        <button onClick={handlePrint} className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition">Print Order</button>
      </div>
    </div>
  );
}
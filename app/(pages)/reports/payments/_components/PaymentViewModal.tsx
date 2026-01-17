"use client";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string | null;
  notes: string | null;
  createdAt: Date;
  credit: {
    book: {
      patient: { fullName: string; identity: string };
    };
  };
}

interface Props {
  payment: Payment;
  onClose: () => void;
}

export default function PaymentViewModal({ payment, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Payment Receipt</h3>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Patient Name</label>
        <input value={payment.credit.book.patient.fullName} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">ID Number</label>
        <input value={payment.credit.book.patient.identity} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Amount Paid (KES)</label>
          <input value={payment.amount.toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 font-bold text-green-700" />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Payment Method</label>
          <input value={payment.paymentMethod} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Transaction Reference</label>
        <input value={payment.transactionRef || "—"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      {payment.notes && (
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Notes</label>
          <textarea value={payment.notes} readOnly rows={3} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none" />
        </div>
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Payment Date</label>
        <input value={new Date(payment.createdAt).toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition">Close</button>
        <button onClick={handlePrint} className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition">Print Receipt</button>
      </div>
    </div>
  );
}
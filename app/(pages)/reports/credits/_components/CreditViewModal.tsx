// app/reports/credits/_components/CreditViewModal.tsx
"use client";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string | null;
  createdAt: Date;
}

interface Credit {
  id: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  lastPaidAt: Date | null;
  createdAt: Date;
  book: {
    id: string;
    patient: {
      fullName: string;
      tel1: string;
      identity: string;
    };
  };
  payments: Payment[];
}

interface Props {
  credit: Credit;
  onClose: () => void;
}

export default function CreditViewModal({ credit, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Credit Details</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Patient Name
          </label>
          <input
            value={credit.book.patient.fullName}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            ID Number
          </label>
          <input
            value={credit.book.patient.identity}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Booking ID
        </label>
        <input
          value={credit.book.id}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Total Credit
          </label>
          <input
            value={`KES ${credit.totalAmount.toLocaleString()}`}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Amount Paid
          </label>
          <input
            value={`KES ${credit.paidAmount.toLocaleString()}`}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 text-green-700"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Outstanding Balance
          </label>
          <input
            value={`KES ${credit.balance.toLocaleString()}`}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 text-red-700 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Status
          </label>
          <input
            value={credit.status}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Last Payment Date
          </label>
          <input
            value={credit.lastPaidAt ? new Date(credit.lastPaidAt).toLocaleString() : "No payments yet"}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Payment History
        </label>
        {credit.payments.length === 0 ? (
          <p className="text-gray-500 py-4">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount (KES)</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {credit.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-2">{new Date(payment.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">{payment.paymentMethod}</td>
                    <td className="px-4 py-2">{payment.transactionRef || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition"
        >
          Close
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition"
        >
          Print
        </button>
      </div>
    </div>
  );
}
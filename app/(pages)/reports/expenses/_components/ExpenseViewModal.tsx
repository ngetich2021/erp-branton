// app/reports/expenses/_components/ExpenseViewModal.tsx
"use client";

interface Expense {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  createdAt: Date;
}

interface Props {
  expense: Expense;
  onClose: () => void;
}

export default function ExpenseViewModal({ expense, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Expense Details</h3>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Transaction ID
        </label>
        <input
          value={expense.transactionId}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Amount (KES)
        </label>
        <input
          value={expense.amount.toLocaleString()}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 text-red-700 font-bold"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Description
        </label>
        <textarea
          value={expense.description}
          readOnly
          rows={5}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Recorded On
        </label>
        <input
          value={new Date(expense.createdAt).toLocaleString()}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
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
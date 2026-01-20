// app/reports/expenses/_components/ExpensesClient.tsx
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import ExpenseViewModal from "./ExpenseViewModal";

interface Expense {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  createdAt: Date;
}

interface Props {
  totalExpenses: number;
  initialExpenses: Expense[];
  userHospitalName: string;
}

export default function ExpensesClient({
  totalExpenses,
  initialExpenses,
  userHospitalName,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedExpense(undefined);
  };

  const handlePrintList = () => window.print();

  const filteredExpenses = initialExpenses.filter((exp) =>
    [exp.transactionId, exp.description]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Expenses Reports – {userHospitalName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              Total Expenses: KES {totalExpenses.toLocaleString()}
            </p>
          </div>

          <button
            onClick={handlePrintList}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Print Report
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search expenses by transaction ID or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Transaction ID</th>
                <th className="px-4 sm:px-6 py-3 text-left">Description</th>
                <th className="px-4 sm:px-6 py-3 text-left">Amount (KES)</th>
                <th className="px-4 sm:px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, index) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(exp)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                      {exp.transactionId}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-red-600">
                      KES {exp.amount.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Expense Details</h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700 leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <ExpenseViewModal expense={selectedExpense} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
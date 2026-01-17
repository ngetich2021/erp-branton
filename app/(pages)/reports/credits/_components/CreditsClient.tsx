// app/reports/credits/_components/CreditsClient.tsx
"use client";

import { useState } from "react";
import CreditViewModal from "./CreditViewModal";

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
  totalCreditAmount: number;
  totalPaid: number;
  totalBalance: number;
  initialCredits: Credit[];
  userHospitalName: string;
}

export default function CreditsClient({
  totalCreditAmount,
  totalPaid,
  totalBalance,
  initialCredits,
  userHospitalName,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | undefined>();

  const openModal = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCredit(undefined);
  };

  const handlePrintList = () => window.print();

  const filteredCredits = initialCredits.filter((credit) =>
    credit.book.patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
    credit.book.patient.identity.toLowerCase().includes(search.toLowerCase()) ||
    credit.status.toLowerCase().includes(search.toLowerCase()) ||
    credit.book.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Credit Reports – {userHospitalName}
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-lg">
                Total Credit: <span className="text-purple-600 font-bold">KES {totalCreditAmount.toLocaleString()}</span>
              </p>
              <p className="text-lg">
                Total Paid: <span className="text-green-600 font-bold">KES {totalPaid.toLocaleString()}</span>
              </p>
              <p className="text-lg">
                Outstanding Balance: <span className="text-red-600 font-bold">KES {totalBalance.toLocaleString()}</span>
              </p>
            </div>
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
          placeholder="Search by patient name, ID number, status or booking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Patient</th>
                <th className="px-4 sm:px-6 py-3 text-left">Booking ID</th>
                <th className="px-4 sm:px-6 py-3 text-left">Total Credit</th>
                <th className="px-4 sm:px-6 py-3 text-left">Paid</th>
                <th className="px-4 sm:px-6 py-3 text-left">Balance</th>
                <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No credit records found
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit, index) => (
                  <tr
                    key={credit.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(credit)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                      {credit.book.patient.fullName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {credit.book.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      KES {credit.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-green-600">
                      KES {credit.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-red-600 font-medium">
                      KES {credit.balance.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {credit.status}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {credit.lastPaidAt ? new Date(credit.lastPaidAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isOpen && selectedCredit && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Credit Details</h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700 leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <CreditViewModal credit={selectedCredit} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
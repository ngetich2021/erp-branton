"use client";


export const dynamic = "force-dynamic";

import { useState } from "react";
import PaymentViewModal from "./PaymentViewModal";

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
  totalPayments: number;
  initialPayments: Payment[];
  userHospitalName: string;
}

export default function PaymentsClient({ totalPayments, initialPayments, userHospitalName }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();

  const filtered = initialPayments.filter(p =>
    p.credit.book.patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.credit.book.patient.identity.toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionRef || "").toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">Payments Reports – {userHospitalName}</h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">KES {totalPayments.toLocaleString()}</p>
          </div>
          <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">Print Report</button>
        </div>

        <input type="text" placeholder="Search by patient name, ID or transaction ref..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">ID Number</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Method</th>
                <th className="px-6 py-3 text-left">Transaction Ref</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">No payments found</td></tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openModal(p)}>
                    <td className="px-6 py-4 text-sm">{i+1}</td>
                    <td className="px-6 py-4">{p.credit.book.patient.fullName}</td>
                    <td className="px-6 py-4">{p.credit.book.patient.identity}</td>
                    <td className="px-6 py-4 font-medium text-green-700">KES {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{p.paymentMethod}</td>
                    <td className="px-6 py-4">{p.transactionRef || "-"}</td>
                    <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <PaymentViewModal payment={selectedPayment} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
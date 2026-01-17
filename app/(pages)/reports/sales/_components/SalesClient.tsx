// app/reports/sales/_components/SalesClient.tsx
"use client";

import { useState } from "react";

type SaleItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

type Sale = {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  items: SaleItem[];
};

interface Props {
  totalSales: number;
  initialSales: Sale[];
  userHospitalName: string;
}

import SaleViewModal from "./SaleViewModal";

export default function SalesClient({ totalSales, initialSales, userHospitalName }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();

  const openModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedSale(undefined);
  };

  const handlePrintList = () => window.print();

  const filteredSales = initialSales.filter((sale) =>
    sale.id.toLowerCase().includes(search.toLowerCase()) ||
    sale.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">Sales Reports – {userHospitalName}</h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">KES {totalSales.toLocaleString()}</p>
          </div>
          <button onClick={handlePrintList} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">Print All</button>
        </div>

        <input type="text" placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Sale ID</th>
                <th className="px-4 sm:px-6 py-3 text-left">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left">Payment Method</th>
                <th className="px-4 sm:px-6 py-3 text-left">Total (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No sales found</td></tr>
              ) : (
                filteredSales.map((sale, index) => (
                  <tr key={sale.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openModal(sale)}>
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-sm">{sale.id}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">{sale.paymentMethod}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">KES {sale.total.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">View Sale</h2>
              <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <SaleViewModal sale={selectedSale} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import ProductViewModal from "./ProductViewModal";

interface Product {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  pic: string | null;
  expires: string | null;
  createdAt: Date;
}

interface Props {
  totalInventoryValue: number;
  totalProducts: number;
  initialProducts: Product[];
  userHospitalName: string;
}

export default function PharmacyClient({
  totalInventoryValue,
  totalProducts,
  initialProducts,
  userHospitalName,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const filtered = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Pharmacy / Inventory Reports – {userHospitalName}
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-lg">Total Products: <span className="text-purple-600 font-bold">{totalProducts}</span></p>
              <p className="text-2xl">Inventory Value: <span className="text-purple-600 font-bold">KES {totalInventoryValue.toLocaleString()}</span></p>
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-purple-600 text-white px-6 py-3 rounded-lg">Print Stock List</button>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Unit Cost</th>
                <th className="px-6 py-3 text-left">Quantity</th>
                <th className="px-6 py-3 text-left">Stock Value</th>
                <th className="px-6 py-3 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No products found</td></tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedProduct(p); setIsOpen(true); }}>
                    <td className="px-6 py-4">{i+1}</td>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4">KES {p.cost.toLocaleString()}</td>
                    <td className="px-6 py-4">{p.quantity}</td>
                    <td className="px-6 py-4 font-medium">KES {(p.cost * p.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4">{p.expires || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between">
              <h2 className="text-xl font-bold">Product Details</h2>
              <button onClick={() => setIsOpen(false)} className="text-3xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <ProductViewModal product={selectedProduct} onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
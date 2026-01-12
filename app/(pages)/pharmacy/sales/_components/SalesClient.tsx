// app/(dashboard)/sales/_components/SalesClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SaleFormModal from "./SaleFormModal";

type SaleRow = {
  id: string;
  total: number;
  createdAt: Date;
  itemCount: number;
};

// ── Add this type ───────────────────────────────────────────────────────
type SaleItemFromApi = {
  name: string;
  unitPrice: number;
  quantity: number;
  productId: string | null;
};
// ────────────────────────────────────────────────────────────────────────

interface Props {
  totalSales: number;
  initialSales: SaleRow[];
  pharmacyName: string;
}

export default function SalesClient({ totalSales, initialSales, pharmacyName }: Props) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("add");
  const [selectedSaleId, setSelectedSaleId] = useState<string | undefined>(undefined);
  
  // Use proper type instead of any[]
  const [initialModalItems, setInitialModalItems] = useState<SaleItemFromApi[]>([]);

  const openModal = async (newMode: "add" | "edit" | "view", sale?: SaleRow) => {
    setMode(newMode);
    setSelectedSaleId(sale?.id);

    if (sale && newMode !== "add") {
      try {
        const res = await fetch(`/api/sales/${sale.id}/items`);
        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();

        // Optional: add safety check
        const items = Array.isArray(data.items) ? data.items : [];
        
        setInitialModalItems(items);
      } catch (err) {
        console.error("Error loading sale items:", err);
        setInitialModalItems([]);
      }
    } else {
      setInitialModalItems([]);
    }

    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales – {pharmacyName}</h1>
          <p className="mt-1 text-3xl font-bold text-purple-700">
            KES {totalSales.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => openModal("add")}
          className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
        >
          + Record Sale
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {initialSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {new Date(sale.createdAt).toLocaleDateString("en-KE")}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {sale.itemCount} item{sale.itemCount !== 1 ? "s" : ""}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                  KES {sale.total.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                  <button
                    onClick={() => openModal("view", sale)}
                    className="mx-2 text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openModal("edit", sale)}
                    className="mx-2 text-green-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {initialSales.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No sales recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
          <div className="h-full w-full max-w-lg bg-white shadow-2xl">
            <SaleFormModal
              mode={mode}
              initialItems={initialModalItems}
              saleId={selectedSaleId}
              onSuccess={handleSuccess}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
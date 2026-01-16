"use client";

import { useEffect, useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import SaleFormModal from "./SaleFormModal";

type PaymentMethod = "mpesa" | "cash";

type SaleSummary = {
  id: string;
  total: number;
  createdAt: Date;
  itemCount: number;
  paymentMethod: PaymentMethod;
};

interface Props {
  totalSales: number;
  initialSales: SaleSummary[];
  pharmacyName: string;
}

export default function SalesClient({
  totalSales,
  initialSales,
  pharmacyName,
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "view">("add");
  const [selectedSale, setSelectedSale] = useState<SaleSummary | null>(null);

  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  useEffect(() => {
    if (!openDropdownId) return;
    const close = () => setOpenDropdownId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdownId]);

  const toggleDropdown = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const saleId = event.currentTarget.dataset.id;
    if (!saleId) return;

    if (openDropdownId === saleId) {
      setOpenDropdownId(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const GAP = 8;
    const WIDTH = 160;
    const HEIGHT = 100;

    let top = rect.bottom + GAP;
    let left = rect.right - WIDTH;

    if (top + HEIGHT > window.innerHeight) top = rect.top - HEIGHT - GAP;
    if (left < GAP) left = GAP;
    if (left + WIDTH > window.innerWidth - GAP) left = window.innerWidth - WIDTH - GAP;

    setDropdownTop(top);
    setDropdownLeft(left);
    setOpenDropdownId(saleId);
  };

  const openModal = (mode: "add" | "view", sale?: SaleSummary) => {
    setModalMode(mode);
    setOpenDropdownId(null);

    if (mode === "add" || !sale) {
      setSelectedSale(null);
    } else {
      setSelectedSale(sale);
    }

    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedSale(null);
  };

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleCancelSale = async (saleId: string) => {
    if (!confirm("Cancel this sale? Stock will be restored.")) return;

    try {
      const res = await fetch(`/api/sales/${saleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text() || "Failed to cancel");
      router.refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  const filteredSales = initialSales.filter((sale) =>
    [
      sale.paymentMethod,
      sale.total.toString(),
      new Date(sale.createdAt).toLocaleDateString("en-KE"),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Sales – {pharmacyName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              KES {totalSales.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Record Sale
          </button>
        </div>

        <input
          type="text"
          placeholder="Search sales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left">Items</th>
                <th className="px-4 sm:px-6 py-3 text-left">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-right">Total</th>
                <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openModal("view", sale)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {new Date(sale.createdAt).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {sale.itemCount} item{sale.itemCount !== 1 && "s"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm capitalize">
                      {sale.paymentMethod === "mpesa" ? "M-Pesa" : "Cash"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-right">
                      KES {sale.total.toLocaleString()}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        data-id={sale.id}
                        onClick={toggleDropdown}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === sale.id && (
                        <div
                          className="fixed z-[10000] w-40 bg-white border rounded-md shadow-lg py-1"
                          style={{ top: `${dropdownTop}px`, left: `${dropdownLeft}px` }}
                        >
                          <button
                            onClick={() => handleCancelSale(sale.id)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel Sale
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? "Record New Sale" : "Sale Receipt"}
              </h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <SaleFormModal
                mode={modalMode}
                sale={selectedSale}
                onSuccess={handleSuccess}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
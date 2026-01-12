// app/(pages)/pharmacy/products/_components/ProductsClient.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import Image from "next/image";
import { deleteProductAction } from "./actions";

type Product = {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  pic?: string | null;
  expires?: string | null;
  createdAt: Date;
};

interface Props {
  totalStockValue: number;
  initialProducts: Product[];
  pharmacyName: string;
}

export default function ProductsClient({
  initialProducts,
  pharmacyName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state ONLY for optimistic delete + client-side filtering
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(new Set());

  // Derived displayed products (exclude optimistically deleted ones)
  const displayedProducts = initialProducts.filter(
    (p) => !optimisticDeletedIds.has(p.id)
  );

  // Derived total value (subtract deleted items optimistically)
  const displayedTotal = displayedProducts.reduce(
    (sum, p) => sum + p.cost * p.quantity,
    0
  );

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const [dropdownId, setDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const openModal = (mode: typeof modalMode, product?: Product) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setModalOpen(true);
    setDropdownId(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    router.refresh(); // fallback – revalidateTag should already trigger re-render
  };

  const handleDelete = (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // Optimistic UI update
    setOptimisticDeletedIds((prev) => new Set([...prev, productId]));

    startTransition(async () => {
      try {
        const result = await deleteProductAction(productId);
        if (!result.success) {
          // Rollback optimistic delete
          setOptimisticDeletedIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          alert(result.error || "Failed to delete product");
        }
        // Success → revalidateTag("products") already called in action → new props arrive
      } catch (err) {
        console.log(err)
        // Rollback on unexpected error
        setOptimisticDeletedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        alert("Unexpected error during delete");
      }
    });
  };

  const filteredProducts = displayedProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.expires && p.expires.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Products – {pharmacyName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              KES {displayedTotal.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            disabled={isPending}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition"
          >
            + Add Product
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products by name or expiry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left">Cost</th>
                <th className="px-4 sm:px-6 py-3 text-left">Quantity</th>
                <th className="px-4 sm:px-6 py-3 text-left">Total Value</th>
                <th className="px-4 sm:px-6 py-3 text-left">Expires</th>
                <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    {search.trim()
                      ? "No products match your search"
                      : "No products found in this pharmacy"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, index) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openModal("view", prod)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {prod.pic ? (
                          <Image
                            src={prod.pic}
                            alt={prod.name}
                            width={40}
                            height={40}
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-md" />
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-[180px] sm:max-w-xs">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                      KES {prod.cost.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {prod.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                      KES {(prod.cost * prod.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {prod.expires || "—"}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPos({
                            top: rect.bottom + window.scrollY + 8,
                            left: Math.max(8, rect.right - 160 + window.scrollX),
                          });
                          setDropdownId(prod.id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {dropdownId === prod.id && (
                        <div
                          className="fixed z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1"
                          style={{
                            top: `${dropdownPos.top}px`,
                            left: `${dropdownPos.left}px`,
                          }}
                        >
                          <button
                            onClick={() => openModal("edit", prod)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {modalMode === "add"
                  ? "Add New Product"
                  : modalMode === "edit"
                  ? "Edit Product"
                  : "View Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ProductFormModal
                mode={modalMode}
                product={selectedProduct}
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
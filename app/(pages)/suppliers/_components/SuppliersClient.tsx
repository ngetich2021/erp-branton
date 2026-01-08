"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2 } from "lucide-react";
import SupplierFormModal from "./AddSupplier";
import { deleteSupplierAction } from "./actionsAddSuppliers";

interface Supplier {
  id: string;
  name: string;
  tel: string;
  description: string;
  createdAt: string;
  hospitalId: string;
  hospitalName: string;
}

interface SuppliersClientProps {
  supplierCount: number;
  initialSuppliers: Supplier[];
  userHospitalName: string;
}

export default function SuppliersClient({
  supplierCount,
  initialSuppliers,
  userHospitalName,
}: SuppliersClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const refreshData = () => {
    setOpenDropdownId(null);
    router.refresh();
  };

  const openModal = (mode: "add" | "edit" | "view", supplier?: Supplier) => {
    setModalMode(mode);
    setSelectedSupplier(supplier);
    setIsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedSupplier(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    refreshData();
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    setOpenDropdownId(null);
    try {
      await deleteSupplierAction(supplierId);
      refreshData();
    } catch {
      alert("Failed to delete supplier. It may not belong to your hospital.");
    }
  };

  const toggleDropdown = (supplierId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openDropdownId === supplierId) {
      setOpenDropdownId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const gap = 8;
    const width = 128;
    const height = 120;

    let top = rect.bottom + gap;
    let left = rect.right - width;

    if (top + height > window.innerHeight) top = rect.top - height - gap;
    if (left < gap) left = gap;
    if (left + width > window.innerWidth - gap) left = window.innerWidth - width - gap;

    setDropdownTop(top);
    setDropdownLeft(left);
    setOpenDropdownId(supplierId);
  };

  useEffect(() => {
    if (!openDropdownId) return;
    const close = () => setOpenDropdownId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdownId]);

  const filteredSuppliers = initialSuppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tel.includes(search) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div className="bg-white rounded-xl px-8 py-6 shadow">
            <h2 className="text-3xl font-bold text-gray-800">Suppliers</h2>
            <p className="text-4xl font-mono text-[#6E1AF3] mt-2">
              {filteredSuppliers.length}
              {filteredSuppliers.length !== supplierCount && (
                <span className="text-xl text-gray-500"> / {supplierCount}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="bg-[#6E1AF3] hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow"
          >
            + Add Supplier
          </button>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by name, phone, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 shadow-sm"
          />
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <p className="text-xl text-gray-500">No suppliers found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Added On</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier, i) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openModal("view", supplier)}
                    >
                      <td className="px-6 py-4 font-medium" onClick={(e) => e.stopPropagation()}>
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(supplier.createdAt)}</td>
                      <td className="px-6 py-4 font-medium">{supplier.name}</td>
                      <td className="px-6 py-4">{supplier.tel}</td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{supplier.description}</td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => toggleDropdown(supplier.id, e)}
                          className="p-2 hover:bg-gray-100 rounded-md"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {openDropdownId === supplier.id && (
                          <div
                            className="fixed z-50 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1"
                            style={{ top: `${dropdownTop}px`, left: `${dropdownLeft}px` }}
                          >
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                openModal("edit", supplier);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div className="fixed top-20 right-0 h-[calc(100vh-5rem)] w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto">
            <button onClick={closeModal} className="absolute top-6 left-6 text-4xl text-gray-600 hover:text-gray-900">
              ×
            </button>
            <div className="p-8 pt-20">
              <SupplierFormModal
                mode={modalMode}
                supplier={selectedSupplier}
                userHospitalName={userHospitalName}
                onSuccess={handleSuccess}
                onClose={closeModal}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import LabFormModal from "./LabFormModal";
import { deleteLabAction } from "./actions";

interface Lab {
  id: string;
  name: string;
  charges: number;
  createdAt: Date;
}

interface Props {
  totalLabs: number;
  initialLabs: Lab[];
  // userHospitalName?: string;   // add back later if per-hospital
}

export default function LabsClient({ totalLabs, initialLabs }: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedLab, setSelectedLab] = useState<Lab | undefined>();
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

  const toggleDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const gap = 8;
    const dropdownWidth = 160;
    const dropdownHeight = 100; // approximate

    let top = rect.bottom + gap;
    let left = rect.right - dropdownWidth;

    // Flip up if not enough space below
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - gap;
    }

    // Keep inside viewport horizontally
    if (left < gap) left = gap;
    if (left + dropdownWidth > window.innerWidth - gap) {
      left = window.innerWidth - dropdownWidth - gap;
    }

    setDropdownTop(top);
    setDropdownLeft(left);
    setOpenDropdownId(id);
  };

  const openModal = (mode: "add" | "edit" | "view", lab?: Lab) => {
    setModalMode(mode);
    setSelectedLab(lab);
    setIsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedLab(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab test?")) return;

    try {
      await deleteLabAction(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete lab:", error);
      alert("Failed to delete lab test. Please try again.");
    }
  };

  const filteredLabs = initialLabs.filter((lab) =>
    lab.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">Laboratory Tests</h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              {totalLabs} test{totalLabs === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + Add Lab Test
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search lab tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Test Name</th>
                <th className="px-4 sm:px-6 py-3 text-left">Charges (KES)</th>
                <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No lab tests found
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab, index) => (
                  <tr
                    key={lab.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal("view", lab)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                      {lab.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                      KES {lab.charges.toLocaleString()}
                    </td>
                    <td
                      className="px-4 sm:px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => toggleDropdown(lab.id, e)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === lab.id && (
                        <div
                          className="fixed z-[10000] w-40 bg-white border rounded-md shadow-lg"
                          style={{
                            top: `${dropdownTop}px`,
                            left: `${dropdownLeft}px`,
                          }}
                        >
                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              openModal("edit", lab);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lab.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">
                {modalMode === "add"
                  ? "Add Lab Test"
                  : modalMode === "edit"
                  ? "Edit Lab Test"
                  : "Lab Test Details"}
              </h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700 leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <LabFormModal
                mode={modalMode}
                lab={selectedLab}
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
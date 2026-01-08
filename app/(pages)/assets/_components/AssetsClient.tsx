// app/assets/_components/AssetsClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { deleteAssetAction } from "./actionsAddAssets";
import AssetFormModal from "./AddAssets";

interface Asset {
  id: string;
  name: string;
  description: string;
  value: number;
  status: string;
  pic: string | null;
  createdAt: Date;
}

interface Props {
  assetCount: number;
  initialAssets: Asset[];
  userHospitalName: string;
}

export default function AssetsClient({
  assetCount,
  initialAssets,
  userHospitalName,
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  /* ------------------ Outside click closes dropdown ------------------ */
  useEffect(() => {
    if (!openDropdownId) return;
    const close = () => setOpenDropdownId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdownId]);

  /* ------------------ Smart dropdown toggle with fixed positioning ------------------ */
  const toggleDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const gap = 8;
    const dropdownWidth = 160;  // w-40 = ~160px
    const dropdownHeight = 100; // 2 items + padding

    // Default: open below and right-aligned
    let top = rect.bottom + gap;
    let left = rect.right - dropdownWidth;

    // Flip to above if not enough space below
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - gap;
    }

    // Adjust horizontally if too far right
    if (left < gap) {
      left = gap;
    }
    if (left + dropdownWidth > window.innerWidth - gap) {
      left = window.innerWidth - dropdownWidth - gap;
    }

    setDropdownTop(top);
    setDropdownLeft(left);
    setOpenDropdownId(id);
  };

  /* ------------------ Modal helpers ------------------ */
  const openModal = (mode: "add" | "edit" | "view", asset?: Asset) => {
    setModalMode(mode);
    setSelectedAsset(asset);
    setIsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedAsset(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await deleteAssetAction(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete asset:", error);
      alert("Failed to delete asset. Please try again.");
    }
  };

  const filteredAssets = initialAssets.filter((asset) =>
    [asset.name, asset.description || "", asset.status || ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Assets – {userHospitalName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              {filteredAssets.length}
              {filteredAssets.length !== assetCount && ` / ${assetCount}`}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + Add Asset
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Image</th>
                <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left">Value</th>
                <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left">Description</th>
                <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500 text-sm sm:text-base"
                  >
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal("view", asset)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>

                    <td className="px-4 sm:px-6 py-4">
                      {asset.pic ? (
                        <Image
                          src={asset.pic}
                          alt={asset.name}
                          width={40}
                          height={40}
                          className="rounded object-cover w-10 h-10"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded" />
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                      {asset.name}
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-sm">
                      KES {asset.value.toLocaleString()}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.status === "good"
                            ? "bg-green-100 text-green-800"
                            : asset.status === "working"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-sm max-w-xs truncate">
                      {asset.description || "—"}
                    </td>

                    {/* Fixed-position dropdown - no more overflow! */}
                    <td
                      className="px-4 sm:px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => toggleDropdown(asset.id, e)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === asset.id && (
                        <div
                          className="fixed z-[10000] w-40 bg-white border rounded-md shadow-lg"
                          style={{ top: `${dropdownTop}px`, left: `${dropdownLeft}px` }}
                        >
                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              openModal("edit", asset);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
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

      {/* Drawer / Modal */}
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
                  ? "Add Asset"
                  : modalMode === "edit"
                  ? "Edit Asset"
                  : "View Asset"}
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
              <AssetFormModal
                mode={modalMode}
                asset={selectedAsset}
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
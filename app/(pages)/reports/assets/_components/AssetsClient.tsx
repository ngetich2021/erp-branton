// app/reports/assets/_components/AssetsClient.tsx
"use client";

import { useState } from "react";
import AssetViewModal from "./AssetViewModal";

interface Asset {
  id: string;
  name: string;
  description: string;
  pic: string;
  value: number;
  status: string;
  createdAt: Date;
}

interface Props {
  totalValue: number;
  initialAssets: Asset[];
  userHospitalName: string;
}

export default function AssetsClient({
  totalValue,
  initialAssets,
  userHospitalName,
}: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();

  const openModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedAsset(undefined);
  };

  const handlePrintList = () => window.print();

  const filteredAssets = initialAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.description.toLowerCase().includes(search.toLowerCase()) ||
      asset.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Assets Reports – {userHospitalName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              Total Value: KES {totalValue.toLocaleString()}
            </p>
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
          placeholder="Search assets by name, description or status..."
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
                <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left">Description</th>
                <th className="px-4 sm:px-6 py-3 text-left">Value (KES)</th>
                <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                <th className="px-4 sm:px-6 py-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(asset)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-sm">
                      {asset.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm max-w-xs truncate">
                      {asset.description}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                      KES {asset.value.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {asset.status}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <button className="text-purple-600 hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b p-4 sm:p-5 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Asset Details</h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-700 leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <AssetViewModal asset={selectedAsset} onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
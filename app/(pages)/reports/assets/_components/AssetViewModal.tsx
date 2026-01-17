// app/reports/assets/_components/AssetViewModal.tsx
"use client";

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
  asset: Asset;
  onClose: () => void;
}

export default function AssetViewModal({ asset, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Asset Details</h3>
      </div>

      {asset.pic && (
        <div className="text-center">
          <img
            src={asset.pic}
            alt={asset.name}
            className="max-h-64 mx-auto object-contain rounded-lg border border-gray-300"
          />
        </div>
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Asset Name
        </label>
        <input
          value={asset.name}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Description
        </label>
        <textarea
          value={asset.description}
          readOnly
          rows={4}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Value (KES)
          </label>
          <input
            value={asset.value.toLocaleString()}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Status
          </label>
          <input
            value={asset.status}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Added On
        </label>
        <input
          value={new Date(asset.createdAt).toLocaleString()}
          readOnly
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition"
        >
          Close
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition"
        >
          Print
        </button>
      </div>
    </div>
  );
}
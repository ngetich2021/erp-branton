"use client";

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
  product: Product;
  onClose: () => void;
}

export default function ProductViewModal({ product, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Product / Stock Item</h3>
      </div>

      {product.pic && (
        <div className="text-center">
          <img
            src={product.pic}
            alt={product.name}
            className="max-h-64 mx-auto object-contain rounded border"
          />
        </div>
      )}

      <div>
        <label className="block text-lg font-semibold mb-2">Name</label>
        <input value={product.name} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-lg font-semibold mb-2">Unit Cost (KES)</label>
          <input value={product.cost.toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold mb-2">Current Quantity</label>
          <input value={product.quantity} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-lg font-semibold mb-2">Stock Value (KES)</label>
          <input value={(product.cost * product.quantity).toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 font-bold" />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2">Expiry Date</label>
        <input value={product.expires || "No expiry date set"} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2">Added On</label>
        <input value={new Date(product.createdAt).toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl">
          Close
        </button>
        <button onClick={handlePrint} className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl">
          Print
        </button>
      </div>
    </div>
  );
}
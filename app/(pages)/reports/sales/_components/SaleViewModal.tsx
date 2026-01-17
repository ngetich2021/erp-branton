// app/reports/sales/_components/SaleViewModal.tsx
"use client";

interface SaleItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface Sale {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  items: SaleItem[];
}

interface Props {
  sale: Sale;
  onClose: () => void;
}

export default function SaleViewModal({ sale, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Sale Details</h3>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Sale ID</label>
        <input value={sale.id} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Date</label>
        <input value={new Date(sale.createdAt).toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Payment Method</label>
        <input value={sale.paymentMethod} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Total (KES)</label>
        <input value={sale.total.toLocaleString()} readOnly className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100" />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Items</label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Unit Price (KES)</th>
                <th className="px-4 py-2 text-left">Total (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-2">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition">Close</button>
        <button type="button" onClick={handlePrint} className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 text-white font-bold text-xl py-5 rounded-xl transition">Print</button>
      </div>
    </div>
  );
}
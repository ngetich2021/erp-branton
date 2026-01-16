"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { recordPaymentAction } from "./actions";

type ActionState = {
  success?: boolean;
  error?: string;
};

interface Props {
  creditId: string;
  currentBalance: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ creditId, currentBalance, onSuccess, onClose }: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      formData.append("creditId", creditId);
      return await recordPaymentAction(formData);
    },
    { success: false }
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <h3 className="text-xl font-bold">Record Payment</h3>
          <p className="text-sm mt-1 opacity-90">
            Remaining balance: <strong>KES {currentBalance.toLocaleString()}</strong>
          </p>
        </div>

        <form action={formAction} className="p-6 space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Amount (KES) <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="number"
              name="amount"
              min="1"
              max={currentBalance}
              step="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="e.g. 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              defaultValue="mpesa"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white outline-none"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Transaction Reference (optional)
            </label>
            <input
              type="text"
              name="transactionRef"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="e.g. QWERTY12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              placeholder="Payment details or reference..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useActionState, useEffect } from "react";
import { saveSupplierAction } from "./actionsAddSuppliers";

type Mode = "add" | "edit" | "view";

interface Supplier {
  id?: string;
  name: string;
  tel: string;
  description: string;
  hospitalName?: string;
}

interface SupplierFormModalProps {
  mode: Mode;
  supplier?: Supplier;
  userHospitalName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function SupplierFormModal({
  mode,
  supplier,
  userHospitalName,
  onSuccess,
  onClose,
}: SupplierFormModalProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [state, formAction, isPending] = useActionState(saveSupplierAction, {
    error: undefined,
    success: false,
  });

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-7">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          {isAdd ? "Add New Supplier" : isEdit ? "Edit Supplier" : "Supplier Details"}
        </h3>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center font-semibold">
          {state.error}
        </div>
      )}

      {isEdit && supplier?.id && (
        <input type="hidden" name="supplierId" value={supplier.id} />
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Supplier Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="name"
          type="text"
          defaultValue={supplier?.name || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Contact Phone (Kenya) <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="tel"
          type="tel"
          pattern="^(\+254|0)[17][0-9]{8}$"
          placeholder="e.g. 0712345678"
          defaultValue={supplier?.tel || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
        <p className="text-sm text-gray-500 mt-1">Format: 0712345678 or +25471...</p>
      </div>

      {/* Hospital is no longer in the form – automatically handled */}
      {isView && (
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Hospital</label>
          <input
            type="text"
            value={userHospitalName}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl"
          />
        </div>
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          required
          name="description"
          rows={5}
          defaultValue={supplier?.description || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition"
        >
          Cancel
        </button>
        {!isView && (
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xl py-5 rounded-xl transition"
          >
            {isPending ? "Saving..." : isAdd ? "Add Supplier" : "Update Supplier"}
          </button>
        )}
      </div>
    </form>
  );
}
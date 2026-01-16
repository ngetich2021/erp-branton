"use client";

import { useState,useEffect } from "react";
import { useActionState } from "react";
import Select from "react-select";
import { saveCreditAction } from "./actions";

type ActionState = {
  success?: boolean;
  error?: string;
};

type Mode = "add" | "edit" | "view";

interface PatientOption {
  value: string;
  label: string;
  patientName: string;
  tel: string;
  identity: string;
}

interface CreditFormData {
  id?: string;
  bookId: string;
  totalAmount: number;
  paidAmount: number;
  patientName?: string;
  patientTel?: string;
  patientIdentity?: string;
}

interface Props {
  mode: Mode;
  credit?: CreditFormData;
  availableBooks: PatientOption[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function CreditFormModal({ mode, credit, availableBooks, onSuccess, onClose }: Props) {
  const isView = mode === "view";

  // Initialize selected value only once from props
  const [selected, setSelected] = useState<PatientOption | null>(() => {
    if (credit?.bookId && availableBooks.length > 0) {
      return availableBooks.find((opt) => opt.value === credit.bookId) ?? null;
    }
    return null;
  });

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => await saveCreditAction(formData),
    { success: false }
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  // Optional: client-side validation before submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isView && !selected?.value) {
      e.preventDefault();
      alert("Please select a patient");
    }
  };

  return (
    <form onSubmit={handleSubmit} action={formAction} className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          {mode === "add" ? "Record New Patient Credit" : mode === "edit" ? "Edit Credit" : "Credit Details"}
        </h3>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center font-semibold">
          {state.error}
        </div>
      )}

      {/* Hidden credit ID for edit/update */}
      {credit?.id && <input type="hidden" name="creditId" value={credit.id} />}

      {/* Patient selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Patient <span className="text-red-600">*</span>
        </label>

        {isView ? (
          <div className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-800">
            {credit?.patientName ?? "N/A"} • {credit?.patientTel ?? "No phone"} •{" "}
            {credit?.patientIdentity ?? "No ID"}
          </div>
        ) : (
          <>
            <Select
              options={availableBooks}
              value={selected}
              onChange={setSelected}
              placeholder="Search patient name, phone or ID..."
              isSearchable
              noOptionsMessage={() => "No matching patients found"}
              classNames={{
                control: () => "border-2 border-gray-300 rounded-xl px-3 py-3 bg-white",
                menu: () => "bg-white border rounded-xl shadow-xl mt-1 overflow-hidden",
                option: () => "px-4 py-2.5 hover:bg-purple-50 cursor-pointer",
              }}
            />
            {/* This hidden input ensures bookId is always sent */}
            <input
              type="hidden"
              name="bookId"
              value={selected?.value ?? ""}
              required={!isView}
            />
          </>
        )}
      </div>

      {/* Total Amount */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Total Amount (KES) <span className="text-red-600">*</span>
        </label>
        <input
          required
          type="number"
          name="totalAmount"
          min="1"
          step="1"
          defaultValue={credit?.totalAmount ?? ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="14500"
        />
      </div>

      {/* Paid Amount */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Initial Paid Amount (KES)
        </label>
        <input
          type="number"
          name="paidAmount"
          min="0"
          step="1"
          defaultValue={credit?.paidAmount ?? 0}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="0"
        />
      </div>

      {/* Buttons */}
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
            disabled={isPending || (!selected?.value && mode === "add")}
            className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-bold text-xl py-5 rounded-xl transition"
          >
            {isPending ? "Saving..." : mode === "add" ? "Create Credit" : "Update Credit"}
          </button>
        )}
      </div>
    </form>
  );
}
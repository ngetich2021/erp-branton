"use client";

import { useActionState, useEffect } from "react";
import { addPatientAction, updatePatientAction } from "./actionsPatient";

type Mode = "add" | "edit" | "view";

interface Patient {
  id?: string;
  fullName: string;
  email: string | null;
  tel1: string;
  tel2: string | null;
  identity: string;
  dob: string;
  sex: string;
  location: string;
  medicalHistory: string | null;
  notes: string | null;
  refferedBy: string | null;
}

interface PatientFormModalProps {
  mode: Mode;
  patient?: Patient;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PatientFormModal({
  mode,
  patient,
  onSuccess,
  onClose,
}: PatientFormModalProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const action = isAdd
    ? addPatientAction
    : updatePatientAction.bind(null, patient?.id || "");

  const [state, formAction, isPending] = useActionState(action, {
    error: undefined,
    success: false,
  });

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-7">
      {/* Header */}
      <div className="md:col-span-2 text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          {isAdd ? "Add New Patient" : isEdit ? "Edit Patient" : "Patient Details"}
        </h3>
      </div>

      {/* Error */}
      {state?.error && (
        <div className="md:col-span-2 bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center font-semibold">
          {state.error}
        </div>
      )}

      {/* Full Name */}
      <div className="md:col-span-2">
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="fullname"
          type="text"
          defaultValue={patient?.fullName || ""}
          readOnly={isView}
          className="w-full px-5 py-4 text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 transition disabled:bg-gray-100"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Email (optional)</label>
        <input
          name="email"
          type="email"
          defaultValue={patient?.email || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* Primary Phone */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Primary Phone <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="tel1"
          type="tel"
          defaultValue={patient?.tel1 || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* Secondary Phone */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Secondary Phone (optional)</label>
        <input
          name="tel2"
          type="tel"
          defaultValue={patient?.tel2 || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* ID Card */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          ID Card Number <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="idcard"
          type="text"
          defaultValue={patient?.identity || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Date of Birth <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="dob"
          type="date"
          defaultValue={patient?.dob || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Gender <span className="text-red-600">*</span>
        </label>
        <select
          required
          name="sex"
          defaultValue={patient?.sex || ""}
          disabled={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Location */}
      <div className="md:col-span-2">
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Location <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="location"
          type="text"
          defaultValue={patient?.location || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* Referred By */}
      <div className="md:col-span-2">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Referred By (optional)</label>
        <input
          name="refferedBy"
          type="text"
          defaultValue={patient?.refferedBy || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      {/* Medical History */}
      <div className="md:col-span-2">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Medical History (optional)</label>
        <textarea
          name="history"
          rows={4}
          defaultValue={patient?.medicalHistory || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <label className="block text-lg font-semibold text-gray-800 mb-2">Additional Notes (optional)</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={patient?.notes || ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="md:col-span-2 mt-8 flex gap-4">
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
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xl py-5 rounded-xl transition disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : isAdd ? "Add Patient" : "Update Patient"}
          </button>
        )}
      </div>
    </form>
  );
}
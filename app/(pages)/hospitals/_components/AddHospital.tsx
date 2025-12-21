// app/hospitals/_components/HospitalForm.tsx
"use client";

import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { updateHospitalAction } from "./editHospitalActions";
import { addHospitalAction } from "./addHospitalActions";

type Hospital = {
  id?: string;
  name: string;
  location: string;
  registrationNo: string;
  incharge?: string;
};

type FormState = {
  success?: boolean;
  message?: string;
  error?: string;
};

const initialState: FormState = {};

type HospitalFormProps = {
  hospital?: Hospital | null; // null/undefined = add mode
  onClose: () => void;
};

export default function HospitalForm({ hospital, onClose }: HospitalFormProps) {
  const { data: session } = useSession();
  const isEdit = !!hospital?.id;

  const action = isEdit ? updateHospitalAction : addHospitalAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const userId = session?.user?.id;

  if (!userId) {
    return <div className="p-4 text-red-600">Please log in.</div>;
  }

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
        onClick={onClose} // Click outside to close
      />

      {/* Form Sidebar (slides from right) */}
      <aside className="fixed inset-y-0 centre md:right-0 top-24 w-screen max-w-lg bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close form"
            >
              <IoMdArrowBack size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEdit ? "Edit Hospital" : "Add New Hospital"}
            </h2>
            {/* Spacer to balance the flex layout */}
            <div className="w-12" />
          </div>

          <form action={formAction} className="space-y-5">
            {/* Hidden fields - preserved exactly */}
            <input type="hidden" name="userId" value={userId} />
            {isEdit && <input type="hidden" name="id" value={hospital.id} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                name="hospital"
                required
                defaultValue={isEdit ? hospital.name : ""}
                placeholder="e.g., City General Hospital"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                name="location"
                required
                defaultValue={isEdit ? hospital.location : ""}
                placeholder="e.g., Nairobi, Kenya"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="registration"
                required
                defaultValue={isEdit ? hospital.registrationNo : ""}
                placeholder="e.g., HOSP-2025-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incharge Doctor
              </label>
              <select
                name="incharge"
                defaultValue={isEdit ? hospital.incharge || "" : ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a doctor (optional)</option>
                <option value="Dr. A">Dr. A</option>
                <option value="Dr. B">Dr. B</option>
                <option value="Dr. C">Dr. C</option>
                <option value="Dr. D">Dr. D</option>
              </select>
            </div>

            {/* Feedback - preserved exactly */}
            {state?.error && (
              <p className="text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
            )}
            {state?.message && (
              <p className="text-green-600 bg-green-50 p-3 rounded-lg">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {pending
                ? (isEdit ? "Updating..." : "Adding...")
                : isEdit
                ? "Update Hospital"
                : "Add Hospital"}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
"use client";

import { useState, useTransition } from "react";
import { attendPatientAction } from "./actions";

interface PatientForAttend {
  id: string;
  patient: { fullName: string };
}

interface LabTest {
  id: string;
  name: string;
  charges: number;
}

type Props = {
  patient: PatientForAttend;
  availableLabs: LabTest[];
  onClose: () => void;
  // Optional: pass consultationFee from server if you want to show it accurately
  consultationFee?: number;
};

export default function AttendSidebar({
  patient,
  availableLabs,
  onClose,
  consultationFee = 0, // fallback — better to pass real value from server
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    prescription: "",
    paymentMethod: "mpesa",
    doctorBill: "",               // ← doctor enters this
    selectedLabIds: [] as string[],
  });

  const doctorBillNum = Number(form.doctorBill) || 0;
  const selectedLabs = availableLabs.filter(l => form.selectedLabIds.includes(l.id));
  const labsTotal = selectedLabs.reduce((sum, lab) => sum + lab.charges, 0);

  // Final amount patient should pay
  const totalDue = consultationFee + doctorBillNum + labsTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.prescription.trim()) {
      setError("Prescription is required");
      return;
    }

    if (doctorBillNum < 0) {
      setError("Doctor bill cannot be negative");
      return;
    }

    const formData = new FormData();
    formData.append("id", patient.id);
    formData.append("attended", "attended");
    formData.append("prescription", form.prescription.trim());
    formData.append("paymentMethod", form.paymentMethod);
    formData.append("doctorBill", form.doctorBill);
    formData.append("testIds", JSON.stringify(form.selectedLabIds));

    startTransition(async () => {
      const result = await attendPatientAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed top-24 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold">{patient.patient.fullName}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prescription <span className="text-red-600">*</span>
          </label>
          <textarea
            value={form.prescription}
            onChange={e => setForm(f => ({ ...f, prescription: e.target.value }))}
            rows={6}
            required
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter prescription / notes / diagnosis..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctors Professional Fee (KSh)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={form.doctorBill}
            onChange={e => setForm(f => ({ ...f, doctorBill: e.target.value }))}
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            value={form.paymentMethod}
            onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnostic / Laboratory Tests (optional)
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
            {availableLabs.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-sm">No tests available</p>
            ) : (
              availableLabs.map(lab => (
                <label key={lab.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.selectedLabIds.includes(lab.id)}
                    onChange={e => {
                      setForm(prev => ({
                        ...prev,
                        selectedLabIds: e.target.checked
                          ? [...prev.selectedLabIds, lab.id]
                          : prev.selectedLabIds.filter(id => id !== lab.id),
                      }));
                    }}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-gray-700 text-sm">
                    {lab.name} (KSh {lab.charges.toLocaleString()})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
          <div className="font-medium">Billing Summary</div>
          <div className="flex justify-between">
            <span>Reception / Registration fee:</span>
            <span>KSh {consultationFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Doctors fee:</span>
            <span>KSh {doctorBillNum.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Laboratory / Diagnostics ({selectedLabs.length}):</span>
            <span>KSh {labsTotal.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Total to pay:</span>
            <span className="text-green-700">KSh {totalDue.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Confirm Attendance"}
        </button>
      </form>
    </div>
  );
}
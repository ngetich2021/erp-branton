'use client';

import React, { useState, useCallback } from "react";
import { saveStaffAction } from "./actionsAddStaff";

type User = { id: string; email: string };
type Role = { id: string; name: string };
type Hospital = { id: string; name: string };

interface AddStaffFormProps {
  users: User[];
  roles: Role[];
  hospitals: Hospital[];
  onClose: () => void;
  currentStaff: {
    userId: string;
    email: string | null;
    fullName: string | null;
    contact1: string | null;
    contact2: string | null;
    role: string | null;
    stationId: string | null;
  }[];
  initialProfile?:
    | {
        userId: string;
        fullName: string | null;
        contact1: string | null;
        contact2: string | null;
        role: string | null;
        stationId: string | null;
        user: { email: string | null };
      }
    | null;
}

export default function AddStaffForm({
  users,
  roles,
  hospitals,
  onClose,
  currentStaff,
  initialProfile,
}: AddStaffFormProps) {
  const isEditMode = !!initialProfile;

  const findStaffByEmail = useCallback(
    (email: string) =>
      currentStaff.find(
        (s) => s.email?.trim().toLowerCase() === email.trim().toLowerCase()
      ),
    [currentStaff]
  );

  const [formData, setFormData] = useState({
    fullName: initialProfile?.fullName?.trim() || "",
    contact1: initialProfile?.contact1?.trim() || "",
    contact2: initialProfile?.contact2?.trim() || "",
    role: initialProfile?.role?.trim() || "",
    hospitalId: initialProfile?.stationId || "",
  });

  const [selectedUserEmail, setSelectedUserEmail] = useState(
    initialProfile?.user.email?.trim() || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = () =>
    users.find((u) => u.email === selectedUserEmail)?.id ||
    initialProfile?.userId ||
    "";

  const handleUserChange = (email: string) => {
    setSelectedUserEmail(email);
    if (isEditMode) return;

    const staff = findStaffByEmail(email);
    if (staff) {
      setFormData({
        fullName: staff.fullName?.trim() || "",
        contact1: staff.contact1?.trim() || "",
        contact2: staff.contact2?.trim() || "",
        role: staff.role?.trim() || "",
        hospitalId: staff.stationId || "",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        contact1: "",
        contact2: "",
        role: "",
        hospitalId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formDataToSend = new FormData(e.currentTarget);

    try {
      const result = await saveStaffAction(formDataToSend);
      if (result.success) {
        alert(isEditMode ? "Staff updated successfully!" : "Staff added successfully!");
        onClose();
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to save staff");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative p-8 h-full overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-8 left-8 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-xl border border-gray-200 text-2xl text-gray-700 hover:text-gray-900 hover:shadow-2xl hover:scale-110 transition-all duration-300 z-50"
        aria-label="Close form"
      >
        ←
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-10 pl-16">
        {isEditMode ? "Edit Staff Member" : "Add New Staff"}
      </h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="userId" value={getCurrentUserId()} />

        {/* User Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Account <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedUserEmail}
            onChange={(e) => handleUserChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          >
            <option value="">Select a user by email</option>
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="e.g. Dr. John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          />
        </div>

        {/* Primary Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Contact <span className="text-red-500">*</span>
          </label>
          <input
            name="contact1"
            type="tel"
            value={formData.contact1}
            onChange={(e) => setFormData({ ...formData, contact1: e.target.value })}
            required
            placeholder="+234 801 234 5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          />
        </div>

        {/* Secondary Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Contact
          </label>
          <input
            name="contact2"
            type="tel"
            value={formData.contact2}
            onChange={(e) => setFormData({ ...formData, contact2: e.target.value })}
            placeholder="+234 801 234 5678 (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Hospital / Station */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Station / Hospital <span className="text-red-500">*</span>
          </label>
          <select
            name="station"
            value={formData.hospitalId}
            onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] focus:border-[#6E1AF3] outline-none transition"
          >
            <option value="">Select a hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#6E1AF3] text-white rounded-lg font-medium hover:bg-[#5a17d0] transition shadow-md disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Update Staff"
              : "Add Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}
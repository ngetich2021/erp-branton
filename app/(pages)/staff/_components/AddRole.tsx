'use client';

import { addRoleAction } from "./actionsRoles";


interface AddRoleProps {
  onSuccess?: () => void;
}

export default function AddRole({ onSuccess }: AddRoleProps) {
  const handleSubmit = async (formData: FormData) => {
    await addRoleAction(formData);
    // Close sidebar on submit (success or not - you can enhance with error handling later)
    onSuccess?.();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Add New Role</h2>

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Role Name
          </label>
          <input
            required
            type="text"
            name="name"  // Fixed: matches server action
            id="name"
            placeholder="e.g., Admin, Manager"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            name="description"
            id="description"
            rows={5}
            placeholder="Describe the role responsibilities..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6E1AF3] outline-none resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-[#6E1AF3] text-white rounded-lg font-medium hover:bg-[#5a17d0] transition"
          >
            Add Role
          </button>

          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
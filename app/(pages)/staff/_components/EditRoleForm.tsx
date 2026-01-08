// _components/EditRoleForm.tsx
'use client';

import { useState } from "react";
import { editRoleAction } from "./actionsRoles";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function EditRoleForm({ role }: { role: Role }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-5 py-2.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium"
      >
        Edit
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await editRoleAction(formData);
        setIsEditing(false);
      }}
      className="flex flex-col gap-3 bg-blue-50 p-4 rounded-lg w-64"
    >
      <input type="hidden" name="id" value={role.id} />

      <input
        type="text"
        name="name"
        defaultValue={role.name}
        required
        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E1AF3]"
      />

      <textarea
        name="description"
        defaultValue={role.description || ""}
        required
        rows={3}
        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6E1AF3] resize-none"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-[#6E1AF3] text-white rounded-md hover:bg-[#5a17d0] text-sm"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
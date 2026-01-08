'use client';

import { useEffect, useState } from "react";
import EditRoleForm from "./EditRoleForm";
import { deleteRoleAction, getRolesAction } from "./actionsRoles";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface ViewRolesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewRoles({ isOpen, onClose }: ViewRolesProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRoles = async () => {
      try {
        const data = await getRolesAction();
        setRoles(data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 top-24 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Roles</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No roles found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-gray-500 text-xs sm:hidden mt-1">
                          {role.description || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {role.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <EditRoleForm role={role} />
                          <form
                            action={async (formData: FormData) => {
                              if (!confirm(`Delete "${role.name}"?`)) return;
                              await deleteRoleAction(formData);
                              const updated = await getRolesAction();
                              setRoles(updated);
                            }}
                          >
                            <input type="hidden" name="id" value={role.id} />
                            <button
                              type="submit"
                              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
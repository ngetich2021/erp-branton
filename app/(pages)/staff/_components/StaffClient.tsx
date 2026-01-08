'use client';

import React, { useState, useMemo, useEffect } from "react";
import AddRole from "./AddRole";
import ViewRoles from "./ViewRoles";
import AddStaffForm from "./AddStaff";
import { deleteStaffAction } from "./actionsAddStaff"; // ← Server action for delete

type User = { id: string; email: string };
type Role = { id: string; name: string };
type Hospital = { id: string; name: string };

type StaffMember = {
  userId: string;
  fullName: string | null;
  email: string | null;
  contact1: string | null;
  contact2: string | null;
  role: string | null;
  stationId: string | null;
};

interface StaffClientProps {
  initialUsers: User[];
  initialRoles: Role[];
  initialHospitals: Hospital[];
  initialStaff: StaffMember[];
  initialStaffCount: number;
}

const ITEMS_PER_PAGE = 12;

export default function StaffClient({
  initialUsers,
  initialRoles,
  initialHospitals,
  initialStaff,
  initialStaffCount,
}: StaffClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [viewRolesOpen, setViewRolesOpen] = useState(false);
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = () => setOpenMenuId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  const toggleMenu = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setStaffFormOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (staff: StaffMember) => {
    const confirmed = confirm(
      `Are you sure you want to delete ${staff.fullName || "this staff member"}? This action cannot be undone.`
    );

    if (!confirmed) {
      setOpenMenuId(null);
      return;
    }

    const result = await deleteStaffAction(staff.userId);

    if (result.success) {
      alert("Staff member deleted successfully!");
      window.location.reload(); // Refresh to show updated list
    } else {
      alert(result.error || "Failed to delete staff member.");
    }

    setOpenMenuId(null);
  };

  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return initialStaff;
    const query = searchTerm.toLowerCase().trim();
    return initialStaff.filter((staff) => {
      return (
        (staff.fullName || "").toLowerCase().includes(query) ||
        (staff.email || "").toLowerCase().includes(query) ||
        (staff.role || "").toLowerCase().includes(query) ||
        (staff.contact1 || "").includes(query) ||
        (staff.contact2 || "").includes(query) ||
        (staff.stationId || "").toLowerCase().includes(query)
      );
    });
  }, [initialStaff, searchTerm]);

  const totalItems = filteredStaff.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaff, currentPage]);

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const getHospitalName = (stationId: string | null) => {
    if (!stationId) return "-";
    const hospital = initialHospitals.find((h) => h.id === stationId);
    return hospital?.name || stationId;
  };

  const handleFormClose = () => {
    setStaffFormOpen(false);
    setEditingStaff(null);
  };

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-wrap gap-6 justify-between items-center mb-4">
        <div className="bg-[#C0A7A7]/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Total Active Staff</h2>
          <span className="text-5xl font-bold text-gray-900">{initialStaffCount}</span>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setEditingStaff(null);
              setStaffFormOpen(true);
            }}
            className="bg-[#6E1AF3] px-8 py-4 rounded-lg text-white font-semibold hover:bg-[#5a17d0] transition shadow-md"
          >
            Add Staff
          </button>
          <button
            onClick={() => setAddRoleOpen(true)}
            className="bg-[#6E1AF3] px-8 py-4 rounded-lg text-white font-semibold hover:bg-[#5a17d0] transition shadow-md"
          >
            Add Role
          </button>
          <button
            onClick={() => setViewRolesOpen(true)}
            className="bg-green-600 px-8 py-4 rounded-lg text-white font-semibold hover:bg-green-700 transition shadow-md"
          >
            View Roles
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-2 max-w-2xl">
        <input
          type="text"
          placeholder="Search by name, email, role, contact, or station..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#6E1AF3]/30 focus:border-[#6E1AF3] outline-none transition"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-20">S/N</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact 1</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact 2</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Station</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 text-lg">
                    {searchTerm ? "No staff found matching your search." : "No staff added yet."}
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff, index) => {
                  const serialNumber = startItem + index;
                  return (
                    <tr key={staff.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{serialNumber}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{staff.fullName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.contact1 || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.contact2 || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-4 py-1.5 text-xs font-semibold text-white bg-[#6E1AF3] rounded-full">
                          {staff.role || "No Role"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getHospitalName(staff.stationId)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => toggleMenu(staff.userId, e)}
                          className="p-2 rounded-lg hover:bg-gray-200 transition"
                        >
                          ⋮
                        </button>

                        {openMenuId === staff.userId && (
                          <div className="absolute right-6 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            <button
                              onClick={() => handleEdit(staff)}
                              className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff)}
                              className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > ITEMS_PER_PAGE && (
          <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t bg-gray-50">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> staff
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Form Sidebar */}
      {staffFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleFormClose}
          />
          <div className="fixed right-0 top-24 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-lg" />
            <AddStaffForm
              users={initialUsers}
              roles={initialRoles}
              hospitals={initialHospitals}
              currentStaff={initialStaff}
              onClose={handleFormClose}
              initialProfile={
                editingStaff
                  ? {
                      userId: editingStaff.userId,
                      fullName: editingStaff.fullName,
                      contact1: editingStaff.contact1,
                      contact2: editingStaff.contact2,
                      role: editingStaff.role,
                      stationId: editingStaff.stationId,
                      user: { email: editingStaff.email },
                    }
                  : null
              }
            />
          </div>
        </>
      )}

      {/* Add Role Sidebar */}
      {addRoleOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setAddRoleOpen(false)} />
          <div className="fixed right-0 top-24 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-lg" />
            <div className="relative h-full p-8">
              <button
                onClick={() => setAddRoleOpen(false)}
                className="absolute top-8 left-8 text-4xl font-light text-gray-700 hover:text-gray-900 transition"
              >
                ←
              </button>
              <div className="mt-12">
                <AddRole onSuccess={() => setAddRoleOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Roles Modal */}
      {viewRolesOpen && <ViewRoles isOpen={viewRolesOpen} onClose={() => setViewRolesOpen(false)} />}
    </main>
  );
}
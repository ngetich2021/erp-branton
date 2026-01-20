// app/hospitals/ClientHospitals.tsx
"use client";

import { useState} from "react";
import { IoAddSharp } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { getHospitals } from "./getHospitals";
import { deleteHospitalAction } from "./deleteHospitalAction";
import HospitalForm from "./AddHospital";

// Types (same as before)
type HospitalFromDB = {
  id: string;
  hospital: string;
  location: string;
  incharge: string | null;
  registrationNo: string;
  dateCreated: string;
  updatedDate: string;
};

type HospitalForForm = {
  id?: string;
  name: string;
  location: string;
  registrationNo: string;
  incharge?: string;
};

// Props from server
type Props = {
  initialHospitals: HospitalFromDB[];
};

export default function ClientHospitals({ initialHospitals }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalForForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitals, setHospitals] = useState<HospitalFromDB[]>(initialHospitals);
  const [loading, setLoading] = useState(false); // usually false after SSR

  // Pagination states – same as before
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Optional: refresh function (can call getHospitals again if needed)
  const refreshHospitals = async () => {
    setLoading(true);
    try {
      const freshData = await getHospitals(); // This will now run from client → make sure it's safe
      setHospitals(freshData || []);
    } catch (err) {
      console.error("Refresh failed", err);
    }
    setLoading(false);
  };

  // Optional: auto-refresh every X seconds (if you want polling)
  // useEffect(() => {
  //   const interval = setInterval(refreshHospitals, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  // Search filter – same
  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic – same as your original code
  const totalItems = filteredHospitals.length;
  const totalPages = pageSize === Infinity ? 1 : Math.ceil(totalItems / pageSize);

  const paginatedHospitals = pageSize === Infinity
    ? filteredHospitals
    : filteredHospitals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = pageSize === Infinity ? totalItems : Math.min(currentPage * pageSize, totalItems);

  const handleCloseAndRefresh = async () => {
    setShowForm(false);
    setEditingHospital(null);
    await refreshHospitals(); // refresh after add/edit
  };

  const handleEdit = (hospital: HospitalFromDB) => {
    setEditingHospital({
      id: hospital.id,
      name: hospital.hospital,
      location: hospital.location,
      registrationNo: hospital.registrationNo,
      incharge: hospital.incharge ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (hospital: HospitalFromDB) => {
    if (!confirm(`Are you sure you want to delete "${hospital.hospital}"? This action cannot be undone.`)) return;

    try {
      await deleteHospitalAction(hospital.id);
      await refreshHospitals();
    } catch (error) {
      alert("Failed to delete hospital. Please try again.");
      console.error(error);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ────────────────────────────────────────────────
  //  ↓  Your JSX stays almost identical from here ↓
  // ────────────────────────────────────────────────

  return (
    <main className="mt-4 flex flex-col gap-6 px-4 overflow-y-auto h-screen">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="p-2 bg-blue-500 rounded-md flex flex-col items-center h-fit w-fit text-white">
          <h2 className="capitalize font-semibold text-lg">all branches</h2>
          <p className="font-bold text-xl">{hospitals.length}</p>
        </div>

        <div className="flex md:gap-2 items-center">
          <label htmlFor="hospital">choose hospital</label>
          <select
            name="hospital"
            id="hospital"
            className="w-48 md:w-fit border border-gray-200 md:p-2 rounded"
          >
            <option value="">---Choose hospital---</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.hospital}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setEditingHospital(null);
            setShowForm(true);
          }}
          className="relative p-2 rounded-md bg-green-500 hover:bg-green-600 flex items-center gap-2 text-white font-medium transition"
        >
          <IoAddSharp size={24} />
          <span>Add Hospital</span>
        </button>
      </div>

      {/* Summary Cards – same */}
      <div className="hidden md:flex justify-between flex-wrap gap-4">
        {/* ... your cards ... */}
      </div>

      {/* Navigation Tabs – same */}
      <div className="bg-gray-200 border border-gray-400 p-3 rounded-md hidden md:flex flex-wrap gap-4 justify-center">
        {/* ... buttons ... */}
      </div>

      {/* Hospitals Table */}
      <div className="mt-6">
        <div className="md:flex flex-col md:justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Hospitals</h2>
          <input
            type="text"
            placeholder="Search by hospital or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 md:w-80"
          />
        </div>

        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading hospitals...</div>
          ) : (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">S/No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Incharge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Updated Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedHospitals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No hospitals match your search" : "No hospitals found"}
                    </td>
                  </tr>
                ) : (
                  paginatedHospitals.map((hospital, index) => (
                    <tr key={hospital.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {hospital.hospital}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{hospital.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {hospital.incharge || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{hospital.registrationNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{hospital.dateCreated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{hospital.updatedDate}</td>
                      <td className="relative px-6 py-4 whitespace-nowrap text-sm">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleEdit(hospital)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Manage Staff</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => handleDelete(hospital)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls – same as before */}
        {!loading && totalItems > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing {startItem}–{endItem} of {totalItems} hospitals
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  value={pageSize === Infinity ? "all" : pageSize}
                  onChange={(e) => {
                    const value = e.target.value === "all" ? Infinity : Number(e.target.value);
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <HospitalForm hospital={editingHospital} onClose={handleCloseAndRefresh} />
      )}
    </main>
  );
}
// app/bookings/_components/BookingsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingFormModal from "./BookingFormModal";

interface BookingListItem {
  id: string;
  consultationFee: number;
  attended: string | null;
  patient: { fullName: string };
}

interface PatientOption {
  id: string;
  fullName: string;
}

interface Props {
  totalBookingsToday: number;
  totalFeesToday: number;
  initialBookings: BookingListItem[];
  hospitalName: string;
  patients: PatientOption[];
}

export default function BookingsClient({
  totalBookingsToday,
  totalFeesToday,
  initialBookings,
  hospitalName,
  patients,
}: Props) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "view">("add");
  const [selectedBooking, setSelectedBooking] = useState<BookingListItem | undefined>();

  const [search, setSearch] = useState("");

  const openAddModal = () => {
    setModalMode("add");
    setSelectedBooking(undefined);
    setIsModalOpen(true);
  };

  const openViewModal = (booking: BookingListItem) => {
    setModalMode("view");
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const filteredBookings = initialBookings.filter((b) =>
    b.patient.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (initialBookings.length === 0) {
      alert("No waiting bookings available to export today.");
      return;
    }

    const headers = ["No", "Patient Name", "Paid (KES)", "Status"];
    const rows = initialBookings.map((booking, index) => [
      index + 1,
      booking.patient.fullName,
      booking.consultationFee,
      booking.attended,
    ]);

    const csvRows = [
      headers.join(","),
      ...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `waiting_bookings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto border-4 border-blue-600 rounded-xl overflow-hidden bg-white shadow-xl">

        {/* Header */}
        <div className="bg-purple-700 p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Waiting Patients Today</h1>
              <p className="text-purple-200 mt-1">{hospitalName}</p>
            </div>
            <div className="bg-purple-900 px-6 py-3 rounded-lg text-center min-w-[220px]">
              <div className="text-3xl md:text-4xl font-bold">{totalBookingsToday}</div>
              <div className="text-purple-200 text-sm">Total Booked Today</div>
            </div>
          </div>
        </div>

        {/* Totals & Export */}
        <div className="bg-purple-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-purple-900">
          <div className="text-lg font-semibold">
            Total Consultation Fees Today:{" "}
            <span className="font-bold text-xl">
              KES {totalFeesToday.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Waiting Patients
          </button>
        </div>

        {/* Search & Add */}
        <div className="p-4 md:p-6 border-b bg-gray-50 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search waiting patient</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md whitespace-nowrap"
          >
            + New Booking
          </button>
        </div>

        {/* Table – only waiting patients */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-purple-100 text-purple-900 uppercase text-sm">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Paid (KES)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No waiting patients today
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b, index) => (
                  <tr
                    key={b.id}
                    className="hover:bg-purple-50 cursor-pointer"
                    onClick={() => openViewModal(b)}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{b.patient.fullName}</td>
                    <td className="px-6 py-4">{b.consultationFee.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        waiting
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <BookingFormModal
              mode={modalMode}
              initialBooking={selectedBooking}
              patients={patients}
              onClose={closeModal}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
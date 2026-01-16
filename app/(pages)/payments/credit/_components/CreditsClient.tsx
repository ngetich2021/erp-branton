"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import CreditFormModal from "./CreditFormModal";
import PaymentModal from "./PaymentModal";
import { deleteCreditAction } from "./actions";

interface Credit {
  id: string;
  bookId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: Date;
  patientName: string;
  patientTel: string;
  patientIdentity: string;
}

interface PatientOption {
  value: string;
  label: string;
  patientName: string;
  tel: string;
  identity: string;
}

interface Props {
  totalOutstanding: number;
  initialCredits: Credit[];
  userHospitalName: string;
  availableBooks: PatientOption[];
}

export default function CreditsClient({
  totalOutstanding,
  initialCredits,
  userHospitalName,
  availableBooks,
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCredit, setSelectedCredit] = useState<Credit | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<Credit | null>(null);

  useEffect(() => {
    if (!openDropdownId) return;
    const close = () => setOpenDropdownId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdownId]);

  const toggleDropdown = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const gap = 8;
    const dropdownWidth = 220;
    const dropdownHeight = 140;

    let top = rect.bottom + gap;
    let left = rect.right - dropdownWidth;

    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - gap;
    }

    if (left < gap) left = gap;
    if (left + dropdownWidth > window.innerWidth - gap) {
      left = window.innerWidth - dropdownWidth - gap;
    }

    setDropdownTop(top);
    setDropdownLeft(left);
    setOpenDropdownId(id);
  };

  const openModal = (mode: "add" | "edit" | "view", credit?: Credit) => {
    setModalMode(mode);
    setSelectedCredit(credit);
    setIsOpen(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCredit(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credit record?")) return;
    try {
      await deleteCreditAction(id);
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(msg);
    }
  };

  const openPaymentModal = (credit: Credit) => {
    setSelectedCreditForPayment(credit);
    setPaymentModalOpen(true);
    setOpenDropdownId(null);
  };

  // Filter here is now mainly for extra safety (server already filters)
  const displayedCredits = initialCredits.filter((c) => c.balance > 0);

  const filteredCredits = displayedCredits.filter((c) =>
    [c.patientName, c.patientTel, c.patientIdentity, c.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-[#C0A7A7] p-4 rounded-md w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold">
              Patient Credits – {userHospitalName}
            </h1>
            <p className="text-2xl sm:text-3xl text-purple-600 mt-2">
              Outstanding: KES {totalOutstanding.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => openModal("add")}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + New Patient Credit
          </button>
        </div>

        <input
          type="text"
          placeholder="Search patient name, phone, ID or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">#</th>
                <th className="px-4 sm:px-6 py-3 text-left">Patient</th>
                <th className="px-4 sm:px-6 py-3 text-left">Tel / ID</th>
                <th className="px-4 sm:px-6 py-3 text-left">Total</th>
                <th className="px-4 sm:px-6 py-3 text-left">Paid</th>
                <th className="px-4 sm:px-6 py-3 text-left">Balance</th>
                <th className="px-4 sm:px-6 py-3 text-left">Status</th>
                <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No patient credits found
                  </td>
                </tr>
              ) : (
                filteredCredits.map((c, index) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal("view", c)}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium">{c.patientName}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      {c.patientTel}
                      {c.patientIdentity !== "N/A" &&
                        ` (${c.patientIdentity.slice(0, 12)}${c.patientIdentity.length > 12 ? "..." : ""})`}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">KES {c.totalAmount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm">KES {c.paidAmount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-red-600">
                      KES {c.balance.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : c.status === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleDropdown(c.id, e)}
                        className="p-2 hover:bg-gray-200 rounded-full transition"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {openDropdownId === c.id && (
                        <div
                          className="fixed z-[10000] w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden divide-y divide-gray-100"
                          style={{ top: `${dropdownTop}px`, left: `${dropdownLeft}px` }}
                        >
                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              openModal("edit", c);
                            }}
                            className="w-full text-left px-5 py-3.5 text-sm hover:bg-gray-50 transition flex items-center gap-3"
                          >
                            Edit Credit
                          </button>

                          <button
                            onClick={() => openPaymentModal(c)}
                            className="w-full text-left px-5 py-3.5 text-sm text-green-700 hover:bg-green-50 font-medium transition flex items-center justify-between"
                          >
                            <span>Record Payment</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              +KES
                            </span>
                          </button>

                          <button
                            onClick={() => handleDelete(c.id)}
                            className="w-full text-left px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end top-0 sm:top-24">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="sticky top-0 z-10 bg-white border-b p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? "New Patient Credit" : modalMode === "edit" ? "Edit Credit" : "Credit Details"}
              </h2>
              <button onClick={closeModal} className="text-3xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <CreditFormModal
                mode={modalMode}
                credit={selectedCredit}
                availableBooks={availableBooks}
                onSuccess={handleSuccess}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}

      {paymentModalOpen && selectedCreditForPayment && (
        <PaymentModal
          creditId={selectedCreditForPayment.id}
          currentBalance={selectedCreditForPayment.balance}
          onSuccess={() => {
            setPaymentModalOpen(false);
            router.refresh();
          }}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}
    </main>
  );
}
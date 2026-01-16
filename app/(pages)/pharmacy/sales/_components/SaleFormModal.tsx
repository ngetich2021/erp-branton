"use client";

import { useActionState, useEffect, useState } from "react";
import { Printer } from "lucide-react";
import {
  getPharmacyProductsAction,
  saveSaleAction,
  getSaleDetailsAction,
  type ProductFromServer,
} from "./actions";

type PaymentMethod = "mpesa" | "cash";
const PAYMENT_OPTIONS = ["mpesa", "cash"] as const;

const getPaymentLabel = (method: PaymentMethod): string =>
  method === "mpesa" ? "M-Pesa" : "Cash";

interface SaleItem {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface CartItem {
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface ItemUiState {
  searchTerm: string;
  suggestions: ProductFromServer[];
}

type SaleForModal = {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  pharmacyName: string;
} | null;

interface SaleFormModalProps {
  mode: "add" | "view";
  sale?: {
    id: string;
    total: number;
    paymentMethod: PaymentMethod;
    createdAt: Date;
    itemCount: number;
  } | null;
  onSuccess: () => void;
  onClose: () => void;
}

const INITIAL_CART: CartItem[] = [
  { productId: null, name: "", unitPrice: 0, quantity: 1 },
];

export default function SaleFormModal({
  mode,
  sale: initialSaleSummary,
  onSuccess,
  onClose,
}: SaleFormModalProps) {
  const isViewMode = mode === "view";

  const [fullSale, setFullSale] = useState<SaleForModal>(null);
  const [isLoading, setIsLoading] = useState(isViewMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductFromServer[] | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() =>
    isViewMode ? [] : INITIAL_CART
  );
  const [uiStates, setUiStates] = useState<ItemUiState[]>(() =>
    isViewMode ? [] : [{ searchTerm: "", suggestions: [] }]
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");

  const [state, formAction, isPending] = useActionState(saveSaleAction, null);

  useEffect(() => {
    if (!isViewMode || !initialSaleSummary?.id) return;

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getSaleDetailsAction(initialSaleSummary.id);
        if (!mounted) return;

        if (res.success && res.sale) {
          setFullSale(res.sale);
          setPaymentMethod(res.sale.paymentMethod);

          const mappedCart = res.sale.items.map((it) => ({
            productId: null,
            name: it.name,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
          }));

          setCart(mappedCart);
          setUiStates(mappedCart.map(() => ({ searchTerm: "", suggestions: [] })));
        } else {
          setLoadError("Failed to load sale details");
        }
      } catch {
        setLoadError("Error loading sale details");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [isViewMode, initialSaleSummary?.id]);

  useEffect(() => {
    if (isViewMode) return;

    let mounted = true;

    const load = async () => {
      const res = await getPharmacyProductsAction();
      if (mounted && res.success) {
        setProducts(res.products ?? []);
      }
    };

    load();
    return () => { mounted = false; };
  }, [isViewMode]);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  const grandTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const addItem = () => {
    setCart((prev) => [...prev, { productId: null, name: "", unitPrice: 0, quantity: 1 }]);
    setUiStates((prev) => [...prev, { searchTerm: "", suggestions: [] }]);
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    setUiStates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const updateUiState = (index: number, patch: Partial<ItemUiState>) => {
    setUiStates((prev) => prev.map((ui, i) => (i === index ? { ...ui, ...patch } : ui)));
  };

  const handleSearchChange = (index: number, value: string) => {
    updateUiState(index, { searchTerm: value });

    if (!products?.length) return;

    const term = value.toLowerCase().trim();
    const filtered = products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 10);
    updateUiState(index, { suggestions: filtered });

    const exactMatch = products.find((p) => p.name.toLowerCase() === term);
    if (exactMatch) {
      updateCartItem(index, {
        productId: exactMatch.id,
        name: exactMatch.name,
        unitPrice: exactMatch.cost,
      });
      updateUiState(index, { searchTerm: exactMatch.name, suggestions: [] });
    } else {
      updateCartItem(index, {
        name: value.trim(),
        productId: null,
        unitPrice: 0,
      });
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 400); // slightly longer delay to ensure layout stability
  };

  if (isViewMode && isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-700 mx-auto" />
          <p className="font-medium text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (isViewMode && loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="mb-3 font-semibold">Error loading receipt</p>
          <p className="mb-4">{loadError}</p>
          <button onClick={onClose} className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  const receiptSale = isViewMode ? fullSale : null;
  const isEmptyReceipt = isViewMode && !receiptSale?.items?.length;

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-4 text-white shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold sm:text-2xl">
          {isViewMode ? "Receipt" : "New Sale"}
        </h2>
        <button onClick={onClose} className="text-3xl hover:text-gray-200" aria-label="Close">
          ×
        </button>
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-6 overflow-hidden p-5 sm:p-6">
        {initialSaleSummary?.id && <input type="hidden" name="saleId" value={initialSaleSummary.id} />}
        {!isViewMode && (
          <>
            <input type="hidden" name="items" value={JSON.stringify(cart)} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
          </>
        )}

        {state && !state.success && !isViewMode && (
          <div className="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
            {state.error ?? "Failed to save sale"}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {isViewMode ? (
            <div
              id="printable-receipt"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md min-h-[600px] flex flex-col print:shadow-none print:border-none print:p-0 print:bg-white print:min-h-0 print:overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="text-center mb-6 print:mb-4">
                <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
                  {receiptSale?.pharmacyName || "Pharmacy"}
                </h1>
                <p className="text-sm text-gray-600 mt-1 print:text-xs">
                  Healthcare & Wellness
                </p>
                <p className="text-xs text-gray-500 mt-1 print:text-[10pt]">
                  Receipt #{receiptSale?.id?.slice(-8) ?? "N/A"}
                </p>
                <p className="text-sm text-gray-700 mt-3 print:text-xs print:mt-1">
                  {receiptSale?.createdAt
                    ? receiptSale.createdAt.toLocaleString("en-KE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date unavailable"}
                </p>
              </div>

              {/* Items Table */}
              <div className="flex-1">
                {isEmptyReceipt ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 print:hidden">
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">No items found</h4>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 shadow-sm print:border-none print:shadow-none">
                    <table className="w-full text-left border-collapse print:text-[10pt]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider print:bg-white print:text-black print:border-b print:border-black">
                          <th className="px-6 py-4 font-semibold print:px-1 print:py-1">Item</th>
                          <th className="px-6 py-4 font-semibold text-center print:px-1 print:py-1">Qty</th>
                          <th className="px-6 py-4 font-semibold text-right print:px-1 print:py-1">Price</th>
                          <th className="px-6 py-4 font-semibold text-right print:px-1 print:py-1">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 print:divide-gray-400">
                        {receiptSale?.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="px-6 py-4 font-medium text-gray-900 print:px-1 print:py-1">{item.name}</td>
                            <td className="px-6 py-4 text-center text-gray-700 print:px-1 print:py-1">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-gray-700 print:px-1 print:py-1">
                              {item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900 print:px-1 print:py-1">
                              {item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total & Footer */}
              <div className="mt-8 pt-6 border-t border-gray-300 print:mt-4 print:pt-3 print:border-t print:border-black">
                <div className="flex justify-between items-center text-xl font-bold print:text-base">
                  <span>Total Amount:</span>
                  <span className="text-purple-800 print:text-black">
                    KES {(receiptSale?.total ?? 0).toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-600 print:text-xs print:mt-2">
                  Payment Method: {getPaymentLabel(paymentMethod)}
                </div>

                <p className="text-xs text-gray-500 mt-3 print:text-[10pt] print:mt-2">
                  Thank you for shopping with us!
                </p>
              </div>
            </div>
          ) : (
            <>
              {cart.map((item, index) => {
                const ui = uiStates[index] ?? { searchTerm: "", suggestions: [] };

                return (
                  <div
                    key={`cart-item-${index}`}
                    className="grid grid-cols-12 gap-4 items-end border-b pb-6 last:border-b-0"
                  >
                    <div className="col-span-6 relative">
                      <input
                        type="text"
                        value={ui.searchTerm}
                        onChange={(e) => handleSearchChange(index, e.target.value)}
                        placeholder="Search product or enter custom item..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        disabled={isPending}
                      />

                      {ui.suggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                          {ui.suggestions.map((p) => (
                            <li
                              key={p.id}
                              className="px-4 py-2.5 cursor-pointer hover:bg-purple-50 flex justify-between text-sm"
                              onClick={() => {
                                updateCartItem(index, {
                                  productId: p.id,
                                  name: p.name,
                                  unitPrice: p.cost,
                                });
                                updateUiState(index, {
                                  searchTerm: p.name,
                                  suggestions: [],
                                });
                              }}
                            >
                              <span>{p.name}</span>
                              <span className="text-gray-600">
                                KES {p.cost.toLocaleString()} • {p.quantity} left
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateCartItem(index, { unitPrice: Number(e.target.value) || 0 })}
                        readOnly={!!item.productId}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500 ${!!item.productId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        min="0"
                        disabled={isPending || !!item.productId}
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          if (q >= 1) updateCartItem(index, { quantity: q });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500"
                        disabled={isPending}
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-2xl leading-none disabled:opacity-50"
                        disabled={isPending}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addItem}
                disabled={isPending}
                className="w-full py-4 mt-6 border-2 border-dashed border-purple-400 text-purple-700 rounded-xl hover:bg-purple-50 font-medium disabled:opacity-50"
              >
                + Add Item
              </button>
            </>
          )}
        </div>

        <div className="border-t pt-6 space-y-6">
          {!isViewMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                disabled={isPending}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500"
              >
                {PAYMENT_OPTIONS.map((m) => (
                  <option key={m} value={m}>{getPaymentLabel(m)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total</span>
            <span className="text-purple-700">KES {grandTotal.toLocaleString()}</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-medium disabled:opacity-50"
            >
              Close
            </button>

            {isViewMode ? (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                disabled={isLoading}
              >
                <Printer size={20} />
                Print Receipt
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending || !cart.every((i) => i.name.trim() && i.quantity >= 1 && i.unitPrice >= 0)}
                className="flex-1 bg-purple-600 text-white py-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Record Sale"}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Updated print styles – stronger isolation + single page enforcement */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 4mm 3mm;
          }

          html, body, #__next, [data-radix-portal], .fixed, .sticky, dialog, .modal-backdrop {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }

          /* Only show the receipt – extremely aggressive hiding */
          body * {
            visibility: hidden !important;
          }

          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }

          #printable-receipt {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            font-family: "Courier New", Courier, monospace !important;
            font-size: 10pt !important;
            line-height: 1.35 !important;
            color: black !important;
            min-height: unset !important;
            height: auto !important;
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }

          /* Prevent any content after receipt from appearing */
          #printable-receipt ~ * {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          table, tbody, tr, td, th {
            page-break-inside: avoid !important;
          }

          /* Force content to fit one page if short */
          #printable-receipt > div:last-child {
            break-before: avoid-page !important;
          }
        }
      `}</style>
    </div>
  );
}
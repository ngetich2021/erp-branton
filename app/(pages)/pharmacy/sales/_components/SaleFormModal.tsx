"use client";

import { useActionState, useEffect, useState } from "react";
import { getPharmacyProductsAction, saveSaleAction, type ProductFromServer } from "./actions";

type CartItem = {
  productId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  stock?: number; // only for real products
};

interface SaleFormModalProps {
  mode: "add" | "edit" | "view";
  initialItems?: Array<{
    name: string;
    unitPrice: number;
    quantity: number;
    productId?: string | null;
  }>;
  saleId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function SaleFormModal({
  mode,
  initialItems = [],
  saleId,
  onSuccess,
  onClose,
}: SaleFormModalProps) {
  const isView = mode === "view";

  // Use the same type as returned by the server action
  const [products, setProducts] = useState<ProductFromServer[] | null>(null);

  const [cart, setCart] = useState<CartItem[]>(
    initialItems.length > 0
      ? initialItems.map((i) => ({
          productId: i.productId ?? null,
          name: i.name,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        }))
      : [{ productId: null, name: "", unitPrice: 0, quantity: 1 }]
  );

  const [state, formAction, isPending] = useActionState(saveSaleAction, null);

  // Load available products
  useEffect(() => {
    if (isView) return;

    let isMounted = true;

    (async () => {
      const result = await getPharmacyProductsAction();

      if (!isMounted) return;

      if (result.success) {
        setProducts(result.products ?? null); // make sure it's null if empty/missing
      } else {
        console.warn("Failed to load products:", result.error);
        // alert("Failed to load products: " + result.error);  ← consider toast instead
        setProducts(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isView]);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const addItem = () => {
    setCart((prev) => [...prev, { productId: null, name: "", unitPrice: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (!products) return;
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;

    updateItem(index, {
      productId: selected.id,
      name: selected.name,
      unitPrice: selected.cost,
      stock: selected.quantity,
    });
  };

  return (
    <form action={formAction} className="flex h-full flex-col p-6 gap-6">
      {saleId && <input type="hidden" name="saleId" value={saleId} />}
      <input type="hidden" name="items" value={JSON.stringify(cart)} />

      <h2 className="text-2xl font-bold text-center">
        {mode === "add" ? "Record New Sale" : mode === "edit" ? "Edit Sale" : "View Sale"}
      </h2>

      {state && !state.success && (
        <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-md">
          {state.error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-5">
        {cart.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 items-end border-b pb-5">
            <div className="col-span-6">
              {isView ? (
                <div className="py-2 font-medium">{item.name || "—"}</div>
              ) : (
                <>
                  <select
                    value={item.productId ?? ""}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    disabled={isPending}
                  >
                    <option value="">Manual / Misc item</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — KES {p.cost.toLocaleString()} (stock: {p.quantity})
                      </option>
                    ))}
                  </select>

                  {!item.productId && (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                      placeholder="Enter item description"
                      className="w-full border rounded px-3 py-2 mt-2"
                      required={!item.productId}
                    />
                  )}
                </>
              )}
            </div>

            <div className="col-span-3">
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) || 0 })}
                placeholder="Price"
                readOnly={!!item.productId || isView}
                className="w-full border rounded px-3 py-2"
                min="0"
                step="1"
              />
            </div>

            <div className="col-span-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  if (q >= 1) updateItem(idx, { quantity: q });
                }}
                readOnly={isView}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {!isView && (
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}

        {!isView && (
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 mt-4 border-2 border-dashed border-purple-400 text-purple-700 rounded hover:bg-purple-50"
          >
            + Add Item
          </button>
        )}
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between text-xl font-bold mb-5">
          <span>Total</span>
          <span>KES {total.toLocaleString()}</span>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 py-3 rounded font-medium hover:bg-gray-300"
          >
            Cancel
          </button>

          {!isView && (
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : mode === "add" ? "Record Sale" : "Update Sale"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
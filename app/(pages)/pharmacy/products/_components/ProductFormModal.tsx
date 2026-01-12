// app/(pages)/pharmacy/products/_components/ProductFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { saveProductAction } from "./actions";

type ActionState = {
  success?: boolean;
  error?: string;
};

type Mode = "add" | "edit" | "view";

interface Product {
  id?: string;
  name: string;
  cost: number;
  quantity: number;
  pic?: string | null;
  expires?: string | null; // expected format: "YYYY-MM-DD"
}

interface Props {
  mode: Mode;
  product?: Product;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProductFormModal({ mode, product, onSuccess, onClose }: Props) {
  const isView = mode === "view";

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => await saveProductAction(formData),
    { success: false }
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.pic || null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  // Cleanup blob URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (jpg, png, webp)");
      e.target.value = "";
      return;
    }

    // Revoke old preview if exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFileName(file.name);
  };

  return (
    <form action={formAction} className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          {mode === "add" ? "Add New Product" : mode === "edit" ? "Edit Product" : "Product Details"}
        </h3>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center font-semibold">
          {state.error}
        </div>
      )}

      {product?.id && <input type="hidden" name="productId" value={product.id} />}

      {/* Product Name */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Product Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="name"
          type="text"
          defaultValue={product?.name ?? ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Paracetamol 500mg"
        />
      </div>

      {/* Cost & Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Cost per Unit (KES) <span className="text-red-600">*</span>
          </label>
          <input
            required
            type="number"
            name="cost"
            min="1"
            step="1"
            defaultValue={product?.cost ?? ""}
            readOnly={isView}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
            placeholder="250"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Quantity in Stock <span className="text-red-600">*</span>
          </label>
          <input
            required
            type="number"
            name="quantity"
            min="0"
            step="1"
            defaultValue={product?.quantity ?? ""}
            readOnly={isView}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
            placeholder="100"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Product Image {mode === "add" ? <span className="text-red-600">*</span> : "(optional - leave blank to keep current)"}
        </label>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required={mode === "add"}
          disabled={isView}
          onChange={handleFileChange}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
        />
        {selectedFileName && (
          <p className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</p>
        )}
      </div>

      {previewUrl && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
          <div className="relative w-full aspect-[4/3] max-h-72 rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-gray-50">
            <Image
              src={previewUrl}
              alt="Product preview"
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
      )}

      {/* Expiry Date - Simple native date picker */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Expiry Date (optional)
        </label>
        <input
          name="expires"
          type="date"
          defaultValue={product?.expires ?? ""}
          disabled={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl py-5 rounded-xl transition"
        >
          Cancel
        </button>

        {!isView && (
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-[#6E1AF3] hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-bold text-xl py-5 rounded-xl transition"
          >
            {isPending ? "Saving..." : mode === "add" ? "Add Product" : "Update Product"}
          </button>
        )}
      </div>
    </form>
  );
}
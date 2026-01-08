// app/assets/_components/AssetFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react"; // Import from "react" in React 19 / Next.js 15+
import Image from "next/image";
import { saveAssetAction } from "./actionsAddAssets";

type ActionState = {
  success?: boolean;
  error?: string;
};

type Mode = "add" | "edit" | "view";

interface Asset {
  id?: string;
  name: string;
  description: string;
  value: number;
  status: string;
  pic?: string | null;
}

interface Props {
  mode: Mode;
  asset?: Asset;
  onSuccess: () => void;
  onClose: () => void;
}

export default function AssetFormModal({ mode, asset, onSuccess, onClose }: Props) {
  const isView = mode === "view";
  const [preview, setPreview] = useState<string | null>(asset?.pic ?? null);

  // Correct React 19 signature with generics
  const [state, submitAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      // Call your existing server action
      const result = await saveAssetAction(formData);
      return result; // { success: true } or { error: "..." }
    },
    { success: false } // initial state
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <form action={submitAction} className="grid grid-cols-1 gap-7 p-8">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-900">
          {mode === "add" ? "Add New Asset" : mode === "edit" ? "Edit Asset" : "Asset Details"}
        </h3>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl text-center font-semibold">
          {state.error}
        </div>
      )}

      {asset?.id && <input type="hidden" name="assetId" value={asset.id} />}

      {/* All your form fields remain exactly the same */}
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Asset Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          name="asset"
          type="text"
          defaultValue={asset?.name ?? ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Value (KES) <span className="text-red-600">*</span>
        </label>
        <input
          required
          type="number"
          name="value"
          min="1"
          step="1"
          defaultValue={asset?.value ?? ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Status <span className="text-red-600">*</span>
        </label>
        <select
          required
          name="status"
          defaultValue={asset?.status ?? ""}
          disabled={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100"
        >
          <option value="" disabled>
            Select status
          </option>
          <option value="good">Good</option>
          <option value="working">Working</option>
          <option value="bad">Bad</option>
        </select>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          required
          name="description"
          rows={5}
          defaultValue={asset?.description ?? ""}
          readOnly={isView}
          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl disabled:bg-gray-100 resize-none"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Image</label>

        {!isView && (
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        )}

        {preview ? (
          <div className="mt-6 relative h-64 w-full">
            <Image
              src={preview}
              alt="Asset image preview"
              fill
              className="object-contain rounded-lg border border-gray-200 bg-gray-50"
            />
          </div>
        ) : (
          <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No image uploaded</p>
          </div>
        )}
      </div>

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
            {isPending ? "Saving..." : mode === "add" ? "Add Asset" : "Update Asset"}
          </button>
        )}
      </div>
    </form>
  );
}
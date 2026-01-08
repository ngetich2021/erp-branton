// app/assets/actions.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function saveAssetAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId;

  // Form data extraction
  const assetId       = formData.get("assetId")?.toString() || null;
  const name          = formData.get("asset")?.toString().trim() || "";
  const description   = formData.get("description")?.toString().trim() || "";
  const valueStr      = formData.get("value")?.toString().trim() || "";
  const status        = formData.get("status")?.toString().trim() || "";
  const imageFile     = formData.get("image") as File | null;

  if (!name || !description || !valueStr || !status) {
    return { error: "All required fields must be filled." };
  }

  const value = Number(valueStr);
  if (isNaN(value) || value <= 0) {
    return { error: "Value must be a positive number" };
  }

  if (!["good", "working", "bad"].includes(status)) {
    return { error: "Invalid status value" };
  }

  // Cloudinary image upload (only if new file is provided)
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "hospital-assets",
            resource_type: "image",
            quality: "auto:good",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("No upload result returned"));
          }
        ).end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return { error: "Failed to upload image" };
    }
  }

  try {
    if (assetId) {
      // Update existing asset
      const existing = await prisma.asset.findUnique({
        where: { id: assetId },
        select: { hospitalId: true },
      });

      if (!existing || existing.hospitalId !== hospitalId) {
        return { error: "You cannot edit assets from another hospital." };
      }

      await prisma.asset.update({
        where: { id: assetId },
        data: {
          name,
          description,
          value,
          status,
          ...(imageUrl && { pic: imageUrl }),
        },
      });
    } else {
      // Create new asset
      await prisma.asset.create({
        data: {
          name,
          description,
          value,
          status,
          pic: imageUrl || "/images/asset-placeholder.jpg",
          hospitalId,
        },
      });
    }

    revalidatePath("/assets");
    return { success: true };
  } catch (error) {
    console.error("Save asset error:", error);
    return {
      error: assetId ? "Failed to update asset." : "Failed to add asset.",
    };
  }
}

export async function deleteAssetAction(assetId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { stationId: true },
  });

  if (!profile?.stationId) throw new Error("No hospital assigned");

  const hospitalId = profile.stationId;

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { hospitalId: true },
  });

  if (!asset || asset.hospitalId !== hospitalId) {
    throw new Error("You can only delete assets from your own hospital.");
  }

  await prisma.asset.delete({ where: { id: assetId } });
  revalidatePath("/assets");
}
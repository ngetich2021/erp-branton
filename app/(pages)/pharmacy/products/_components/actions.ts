// app/(pages)/pharmacy/products/actions.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath} from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
});

type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

interface ProductInput {
  productId?: string | null;
  name: string;
  cost: number;
  quantity: number;
  expires?: string | null;
  image?: File | null;
}

async function getUserPharmacyId(userId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    throw new Error("No hospital/station assigned. Contact support.");
  }

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { hospitalId: profile.stationId },
    select: { id: true },
  });

  if (!pharmacy?.id) {
    throw new Error("No pharmacy configured for your hospital. Contact support.");
  }

  return pharmacy.id;
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files allowed (jpg, png, webp)");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image too large (max 5MB)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "pharmacy-products",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload succeeded but no result"));
          resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
}

async function validateAndParseForm(formData: FormData): Promise<ProductInput> {
  const productId   = formData.get("productId")?.toString() ?? null;
  const name        = (formData.get("name")?.toString() ?? "").trim();
  const costStr     = (formData.get("cost")?.toString() ?? "").trim();
  const quantityStr = (formData.get("quantity")?.toString() ?? "").trim();
  const expires     = formData.get("expires")?.toString().trim() ?? null;
  const image       = formData.get("image");

  if (!name || !costStr || !quantityStr) {
    throw new Error("Name, cost and quantity are required.");
  }

  const cost     = Number(costStr);
  const quantity = Number(quantityStr);

  if (Number.isNaN(cost) || cost <= 0) throw new Error("Cost must be positive");
  if (Number.isNaN(quantity) || quantity < 0) throw new Error("Quantity cannot be negative");

  return {
    productId,
    name,
    cost,
    quantity,
    expires: expires || null,
    image: image instanceof File && image.size > 0 ? image : undefined,
  };
}

export async function saveProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Please sign in" };

    const pharmId = await getUserPharmacyId(session.user.id);
    const input   = await validateAndParseForm(formData);

    let picUrl: string | undefined;

    if (input.image) {
      picUrl = await uploadImageToCloudinary(input.image);
    }

    if (input.productId) {
      // UPDATE
      const existing = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { pharmId: true },
      });

      if (!existing || existing.pharmId !== pharmId) {
        return { success: false, error: "You can only edit your pharmacy's products" };
      }

      await prisma.product.update({
        where: { id: input.productId },
        data: {
          name: input.name,
          cost: input.cost,
          quantity: input.quantity,
          expires: input.expires ?? undefined,
          ...(picUrl && { pic: picUrl }),
        },
      });
    } else {
      // CREATE
      if (!picUrl) {
        return { success: false, error: "Image is required for new products" };
      }

      await prisma.product.create({
        data: {
          name: input.name,
          cost: input.cost,
          quantity: input.quantity,
          pic: picUrl,
          expires: input.expires,
          pharmId,
        },
      });
    }

    revalidatePath("/products");
    return { success: true, message: input.productId ? "Updated" : "Created" };
  } catch (err) {
    console.error("saveProduct failed:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Please sign in" };

    const pharmId = await getUserPharmacyId(session.user.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { pharmId: true },
    });

    if (!product || product.pharmId !== pharmId) {
      return { success: false, error: "You can only delete your pharmacy's products" };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("deleteProduct failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete" };
  }
}
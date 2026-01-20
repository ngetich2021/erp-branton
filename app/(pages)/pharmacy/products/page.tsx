// app/(pages)/pharmacy/products/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ProductsClient from "./_components/ProductsClient";

export const revalidate = 1;

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view products.</p>
      </div>
    );
  }

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
          <p className="text-xl mb-4 text-red-800">No pharmacy assigned</p>
          <p className="text-gray-600">
            Please contact an administrator to assign you to a pharmacy/station.
          </p>
        </div>
      </div>
    );
  }

  const hospitalId = profile.stationId;

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { hospitalId },
    select: { id: true, name: true },
  });

  if (!pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200">
          <p className="text-xl mb-4 text-red-800">No pharmacy found</p>
          <p className="text-gray-600">
            Please contact support to set up a pharmacy for your hospital.
          </p>
        </div>
      </div>
    );
  }

  const pharmId = pharmacy.id;

  const products = await prisma.product.findMany({
    where: { pharmId },
    select: {
      id: true,
      name: true,
      cost: true,
      quantity: true,
      pic: true,
      expires: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStockValue = products.reduce((sum, p) => sum + p.cost * p.quantity, 0);

  return (
    <ProductsClient
      totalStockValue={totalStockValue}
      initialProducts={products}
      pharmacyName={pharmacy.name || "Your Pharmacy"}
    />
  );
}
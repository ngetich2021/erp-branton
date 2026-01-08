// actions/roleActions.ts
'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Add Role
export async function addRoleAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || !description) {
    return { error: "Role name and description are required" };
  }

  try {
    await prisma.role.create({
      data: { name: name.trim(), description: description.trim() },
    });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Error creating role:", error);
    return { error: "Failed to add role" };
  }
}

// Edit Role
export async function editRoleAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!id || !name || !description) {
    return { error: "Invalid or missing data" };
  }

  try {
    await prisma.role.update({
      where: { id },
      data: { name: name.trim(), description: description.trim() },
    });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    return { error: "Failed to update role" };
  }
}

// Delete Role
export async function deleteRoleAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Invalid role ID" };
  }

  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { error: "Failed to delete role" };
  }
}

// Get all roles
export async function getRolesAction() {
  return await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
  });
}
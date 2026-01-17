"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

export async function addPatientAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { stationId: true },
  });

  if (!profile?.stationId) return { error: "No hospital station assigned" };

  const hospitalId = profile.stationId;

  const fullname = (formData.get("fullname") as string)?.trim();
  const tel1    = (formData.get("tel1")    as string)?.trim();
  const idcard  = (formData.get("idcard")  as string)?.trim();
  const dob     = formData.get("dob")      as string;
  const sex     = formData.get("sex")      as string;
  const location = (formData.get("location") as string)?.trim();

  if (!fullname || !tel1 || !idcard || !dob || !sex || !location) {
    return { error: "All required fields must be filled." };
  }

  try {
    await prisma.patient.create({
      data: {
        fullName: fullname,
        servedById: userId,
        hospitalId,
        email: (formData.get("email") as string)?.trim() ?? null,
        tel1,
        tel2: (formData.get("tel2") as string)?.trim() ?? null,
        identity: idcard,
        dob,
        sex,
        location,
        medicalHistory: (formData.get("history") as string)?.trim() ?? null,
        notes: (formData.get("notes") as string)?.trim() ?? null,
        refferedBy: (formData.get("refferedBy") as string)?.trim() ?? null,
      },
    });

    revalidatePath("/patients");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to add patient." };
  }
}

export async function updatePatientAction(
  patientId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const fullname = (formData.get("fullname") as string)?.trim();
  const tel1     = (formData.get("tel1")    as string)?.trim();
  const idcard   = (formData.get("idcard")  as string)?.trim();
  const dob      = formData.get("dob")      as string;
  const sex      = formData.get("sex")      as string;
  const location = (formData.get("location") as string)?.trim();

  if (!fullname || !tel1 || !idcard || !dob || !sex || !location) {
    return { error: "All required fields must be filled." };
  }

  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        fullName: fullname,
        email: (formData.get("email") as string)?.trim() ?? null,
        tel1,
        tel2: (formData.get("tel2") as string)?.trim() ?? null,
        identity: idcard,
        dob,
        sex,
        location,
        medicalHistory: (formData.get("history") as string)?.trim() ?? null,
        notes: (formData.get("notes") as string)?.trim() ?? null,
        refferedBy: (formData.get("refferedBy") as string)?.trim() ?? null,
      },
    });

    revalidatePath("/patients");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to update patient." };
  }
}

export async function deletePatientAction(patientId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.patient.delete({ where: { id: patientId } });
    revalidatePath("/patients");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to delete patient." };
  }
}

// ────────────────────────────────────────────────
// Client-facing shape (what the page sends to component)
export type PatientListItem = {
  id: string;
  fullName: string;
  tel1: string;
  tel2: string | null;
  location: string;
  createdAt: string;     // ISO string
  email: string | null;
  identity: string;
  dob: string;           // YYYY-MM-DD
  sex: string;
  medicalHistory: string | null;
  notes: string | null;
  refferedBy: string | null;
};

export async function getPatients(hospitalId: string): Promise<PatientListItem[]> {
  const patients = await prisma.patient.findMany({
    where: { hospitalId },
    select: {
      id: true,
      fullName: true,
      tel1: true,
      tel2: true,
      location: true,
      createdAt: true,
      email: true,
      identity: true,
      dob: true,
      sex: true,
      medicalHistory: true,
      notes: true,
      refferedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return patients.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    dob: p.dob.toString().split("T")[0],
  }));
}
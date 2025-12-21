// app/actions/getHospitals.ts
'use server';

import prisma from "@/lib/prisma";


export async function getHospitals() {
  try {
    const hospitals = await prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        incharge: true,
        registrationNo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return hospitals.map((hospital) => ({
      id: hospital.id,
      hospital: hospital.name,
      location: hospital.location,
      incharge: hospital.incharge || '',
      registrationNo: hospital.registrationNo,
      dateCreated: hospital.createdAt.toISOString().split('T')[0],
      updatedDate: hospital.updatedAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
}
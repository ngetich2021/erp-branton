 
import ClientHospitals from "./_components/ClientHospitals";
import { getHospitals } from "./_components/getHospitals";

export const revalidate = 60;

export default async function HospitalsPage() {
  const hospitals = await getHospitals();   

  return <ClientHospitals initialHospitals={hospitals} />;
}
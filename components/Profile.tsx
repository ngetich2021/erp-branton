"use client"

import { useSession } from "next-auth/react";
import Image from "next/image";
import { SignOutButton } from "./Sign-Out";

interface ProfileProps {
  id: string;
}

export default function Profile({ id }: ProfileProps) {

    const {data:session} = useSession();
    
  return (
    <main className="fixed top-20 right-20 w-64 bg-gray-200 border border-gray-400 rounded-md p-4 shadow-lg z-50">
      <h2 className="text-lg font-semibold mb-2">{session?.user.name}</h2>
      <h2 className="text-lg font-semibold mb-2">{session?.user.email}</h2>
      <p className="text-sm text-gray-700">User ID: {id}</p>
      <Image src={session?.user.image || ''} alt="" width={24} height={24}/>
      <SignOutButton/>
    </main>
  );
}
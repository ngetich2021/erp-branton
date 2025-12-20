import { auth } from '@/auth';

export default async function Home() {
 const session = await auth();


  return (
    <div>
      <h2>{session?.user.email}</h2>
      <h2>{session?.user.name}</h2>
      <h2>{session?.user.role}</h2>
    </div>
  )
}

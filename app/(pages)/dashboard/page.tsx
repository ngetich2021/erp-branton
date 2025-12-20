import { auth } from "@/auth"


export default async function Dashboard(){
  const session = await auth();
  return(
    <main>
      <h3>hello world ... dashboard page</h3>
      <h3>{session?.user.email}</h3>
    </main>
  )
}
// // app/page.tsx (or wherever your Home component is)
// import { auth } from '@/auth';
// import GoogleSignIn from '@/components/Google';
// import { SignOutButton } from '@/components/Sign-Out';

// export default async function Home(props) {
//   const session = await auth();

//   return (
//     <div className="p-8 max-w-md mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Welcome!</h1>

//       {session?.user ? (
//         <>
//           <div className="space-y-2 mb-8">
//             <p><strong>Email:</strong> {session.user.email}</p>
//             <p><strong>Name:</strong> {session.user.name || 'N/A'}</p>
//             <p><strong>Role:</strong> {session.user.role || 'N/A'}</p>
//           </div>

//           <SignOutButton />
//         </>
//       ) : (
//         <GoogleSignIn/>
//       )}
//     </div>
//   );
// }
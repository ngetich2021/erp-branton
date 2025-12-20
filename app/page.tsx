
import GoogleSignIn from '@/components/Google';

export default async function Home(props) {

  return (
    <div className="p-8 max-w-md mx-auto">     
        <GoogleSignIn/>      
    </div>
  );
}
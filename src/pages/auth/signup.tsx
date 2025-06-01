import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

const SignUp = () => {
  const router = useRouter();

  return (
    <Layout title="Sign Up Disabled - VectorLogo">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm my-12">
        <div className="text-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up Disabled</h1>
        
        <div className="text-gray-600 text-center mb-6">
          <p className="mb-3">
            Public sign-ups are currently disabled. This site is for browsing vector logos only.
          </p>
          <p>
            Only administrators can upload and manage logos.
          </p>
        </div>
        
        <div className="mt-6 flex flex-col space-y-4">
          <Link 
            href="/" 
            className="w-full px-4 py-2 bg-primary-600 text-white text-center rounded-md hover:bg-primary-700 transition-colors"
          >
            Return to Homepage
          </Link>
          
          <Link 
            href="/admin/login" 
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;

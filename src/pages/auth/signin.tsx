import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

const SignIn = () => {
  const router = useRouter();

  // Redirect to admin login page
  useEffect(() => {
    router.push('/admin/login');
  }, [router]);

  return (
    <Layout title="Sign In Disabled - VectorLogo">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">Redirecting to Admin Login</h1>
        
        <div className="text-gray-600 text-center mb-6">
          <p className="mb-3">
            Public login is disabled. This site is for browsing vector logos only.
          </p>
          <p>
            Only administrators can log in to upload and manage logos.
          </p>
        </div>
        
        <div className="mt-6 flex flex-col space-y-4">
          <Link 
            href="/admin/login" 
            className="w-full px-4 py-2 bg-primary-600 text-white text-center rounded-md hover:bg-primary-700 transition-colors"
          >
            Go to Admin Login
          </Link>
          
          <Link 
            href="/" 
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;

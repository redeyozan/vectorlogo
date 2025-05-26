import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';

// Dynamically import auth components to prevent SSR issues
const AuthComponentsWrapper = dynamic(
  () => import('@/components/AuthComponentsWrapper'),
  { ssr: false }
);

const SignIn = () => {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <Layout title="Sign In - VectorLogo">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        {authError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {authError}
          </div>
        )}
        
        <AuthComponentsWrapper view="sign_in" />
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;

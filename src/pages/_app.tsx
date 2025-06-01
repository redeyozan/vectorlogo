import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Layout component that wraps all pages
function Layout({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);

  // Set up storage bucket when the app starts
  useEffect(() => {
    async function setupStorage() {
      try {
        // Only run setup if user is logged in
        if (user) {
          const response = await fetch('/api/setup-storage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const data = await response.json();
          console.log('Storage setup result:', data);
        }
      } catch (error) {
        console.error('Error setting up storage:', error);
      } finally {
        setInitializing(false);
      }
    }

    setupStorage();
  }, [user]);

  // Skip layout on login and register pages
  const noLayoutPages = ['/login', '/register'];
  const skipLayout = noLayoutPages.includes(router.pathname);

  if (skipLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  // Create a new supabase browser client on every first render
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionContextProvider>
  );
}

import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

type AuthComponentsWrapperProps = {
  view?: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password';
};

const AuthComponentsWrapper = ({ view = 'sign_in' }: AuthComponentsWrapperProps) => {
  const supabaseClient = useSupabaseClient();
  
  // Get the origin for redirects
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  return (
    <Auth
      supabaseClient={supabaseClient}
      appearance={{ theme: ThemeSupa }}
      theme="light"
      providers={[]}
      redirectTo={`${origin}/`}
      view={view}
    />
  );
};

export default AuthComponentsWrapper;

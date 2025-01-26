'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to VorpBall
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in with Google to continue
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb', // blue-600
                    brandAccent: '#1d4ed8', // blue-700
                  },
                },
              },
              className: {
                container: 'supabase-auth-ui-container',
                button: 'supabase-auth-ui-button',
                input: 'supabase-auth-ui-input',
                label: 'supabase-auth-ui-label',
                anchor: 'supabase-auth-ui-anchor',
              },
            }}
            view="sign_in"
            showLinks={false}
            providers={['google']}
            onlyThirdPartyProviders={true}
            theme={localStorage.theme === 'dark' ? 'dark' : 'light'}
            redirectTo={process.env.NODE_ENV === 'production' 
              ? 'https://vorpball.com/auth/callback'
              : `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
} 
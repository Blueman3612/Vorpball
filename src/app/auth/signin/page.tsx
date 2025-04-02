'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslations } from '@/lib/i18n';

export default function SignIn() {
  const { theme } = useTheme();
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-800 dark:to-gray-900 animate-gradient-slow bg-gradient-size" />

      <div className="relative max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="transform transition-all">
          {/* Logo and Title Section */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center transform transition-transform hover:scale-105">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('auth.welcome')}
            </h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {t('auth.welcomeDescription')}
            </p>
          </div>

          {/* Auth Container */}
          <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-8">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#4f46e5', // indigo-600
                      brandAccent: '#4338ca', // indigo-700
                    },
                    borderWidths: {
                      buttonBorderWidth: '0px',
                    },
                    radii: {
                      borderRadiusButton: '0.75rem',
                      buttonBorderRadius: '0.75rem',
                      inputBorderRadius: '0.75rem',
                    },
                  },
                },
                className: {
                  container: 'space-y-4',
                  button: 'relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200',
                  input: 'appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 transition-colors duration-200',
                  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
                  anchor: 'font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300',
                },
              }}
              view="sign_in"
              showLinks={false}
              providers={['google']}
              onlyThirdPartyProviders={true}
              theme={theme}
              redirectTo={process.env.NODE_ENV === 'production' 
                ? 'https://vorpball.com/auth/callback'
                : `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
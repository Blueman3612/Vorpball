'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    document.addEventListener('navigationstart', handleStart);
    document.addEventListener('navigationend', handleComplete);
    document.addEventListener('routeChangeStart', handleStart);
    document.addEventListener('routeChangeComplete', handleComplete);
    document.addEventListener('routeChangeError', handleComplete);

    return () => {
      document.removeEventListener('navigationstart', handleStart);
      document.removeEventListener('navigationend', handleComplete);
      document.removeEventListener('routeChangeStart', handleStart);
      document.removeEventListener('routeChangeComplete', handleComplete);
      document.removeEventListener('routeChangeError', handleComplete);
    };
  }, []);

  // Reset loading state when the route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>
      <main 
        className={cn(
          "flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-950 dark:to-gray-800 w-full transition-all duration-300",
          isLoading && "blur-[2px] brightness-[0.9]"
        )}
      >
        <div className="pl-14">
          {children}
        </div>
      </main>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
} 
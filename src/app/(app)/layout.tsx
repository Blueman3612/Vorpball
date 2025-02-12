'use client';

import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 hidden md:block">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-950 dark:to-gray-800">
        {children}
      </main>
    </div>
  );
} 
'use client';

import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import LoginPage from '@/app/account/page';
import { useUser } from '@/hooks/useUser';
import { UserProvider } from '@/hooks/useUser';
import { ReactNode } from 'react';
import ScrollToTop from '@/components/ScrollToTop';
import { DetailPortalProvider } from '@/components/DetailPortal'; // ✅ 新增

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900 text-white`}
      >
        <UserProvider>
          <DetailPortalProvider>
            {' '}
            {/* ✅ 新增 */}
            <AppContent>{children}</AppContent>
          </DetailPortalProvider>{' '}
          {/* ✅ 新增 */}
        </UserProvider>
        {/* 防止 tailwind purge shadcn calendar className */}
        <div className="hidden">
          w-8 h-8 text-muted-foreground text-sm text-[0.8rem] font-normal rounded bg-primary
          text-primary-foreground bg-accent text-accent-foreground
        </div>
      </body>
    </html>
  );
}

function AppContent({ children }: { children: ReactNode }) {
  const { 使用者 } = useUser();

  if (!使用者) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <LoginPage />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

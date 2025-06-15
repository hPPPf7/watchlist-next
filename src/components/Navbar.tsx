'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

const routes = [
  { href: '/search', label: '🔍 搜尋' },
  { href: '/movies', label: '🎬 電影' },
  { href: '/progress', label: '📺 影集' },
  { href: '/account', label: '👤 帳戶' },
];

export default function Navbar() {
  const { 使用者, isLoading, 登出 } = useUser();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-zinc-700 bg-zinc-900 shadow-sm">
      <div className="flex size-full items-center justify-between px-4">
        {/* 左邊 Logo */}
        <div className="flex min-w-[50px] items-center">
          <div className="whitespace-nowrap text-lg font-bold text-white">
            <span className="block sm:hidden">🍿</span>
            <span className="hidden sm:block">🍿 Watchlist Pro</span>
          </div>
        </div>

        {/* 中間 導覽列（手機/桌機都有） */}
        <div className="ml-2 flex flex-1 items-center justify-start gap-1 sm:ml-0 sm:justify-center sm:gap-2 [@media(max-width:360px)]:gap-0.5">
          {routes.map(({ href, label }) => (
            <Link key={href} href={href}>
              <button
                className={cn(
                  'px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition whitespace-nowrap',
                  '[@media(max-width:360px)]:px-1.5 [@media(max-width:360px)]:text-[10px]',
                  pathname === href
                    ? 'bg-zinc-700 text-white border border-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                )}
              >
                {label}
              </button>
            </Link>
          ))}
        </div>

        {/* 右邊 登入登出（只有桌機版顯示） */}
        <div className="hidden items-center gap-2 whitespace-nowrap sm:flex">
          {isLoading ? (
            <div className="flex items-center gap-1 text-sm text-zinc-400">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse [animation-delay:0.2s]">●</span>
              <span className="animate-pulse [animation-delay:0.4s]">●</span>
              <span>載入中...</span>
            </div>
          ) : 使用者 ? (
            <>
              <span className="text-sm text-white">{使用者.displayName || '使用者'}</span>
              <button
                onClick={登出}
                className="rounded bg-zinc-700 px-4 py-2 text-sm text-white transition duration-200 hover:bg-red-600"
              >
                登出
              </button>
            </>
          ) : (
            <Link href="/account">
              <button className="rounded bg-zinc-700 px-4 py-2 text-sm text-white transition duration-200 hover:bg-zinc-600">
                登入
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

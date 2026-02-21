'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/help', label: 'Help' },
];

const authNavItems = [
  { href: '/', label: 'Home' },
  { href: '/modes', label: 'Modes' },
  { href: '/features', label: 'Features' },
  { href: '/help', label: 'Help' },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === 'authenticated' && session?.user;
  const navItems = isLoggedIn ? authNavItems : publicNavItems;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center gap-6">
      <ul className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-surface-2 text-accent-primary'
                  : 'text-foreground/70 hover:text-foreground hover:bg-surface-1'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {status === 'loading' ? (
        <div className="w-20 h-9 bg-surface-1 rounded-lg animate-pulse" />
      ) : isLoggedIn ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
              {session.user.name?.charAt(0).toUpperCase() ||
                session.user.email?.charAt(0).toUpperCase() ||
                'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground/90 max-w-24 truncate">
              {session.user.name || 'User'}
            </span>
            <svg
              className={cn('w-4 h-4 text-foreground/60 transition-transform', showUserMenu && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-surface-2 rounded-lg shadow-lg border border-border-default z-50">
              <Link
                href="/account"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-surface-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Account
              </Link>
              <Link
                href="/account/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-surface-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </Link>
              <hr className="my-2 border-border-default" />
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-surface-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login">
          <Button size="sm" className="hidden sm:inline-flex">
            Login
          </Button>
        </Link>
      )}

      <button
        className="md:hidden p-2 rounded-lg hover:bg-surface-1 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  );
}


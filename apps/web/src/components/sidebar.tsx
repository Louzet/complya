'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'relative flex flex-col flex-shrink-0 h-screen bg-slate-950 transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-400 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div
        className={clsx(
          'flex h-14 flex-shrink-0 items-center border-b border-slate-800',
          collapsed ? 'justify-center' : 'px-5',
        )}
      >
        <span className="select-none text-lg font-bold tracking-tight text-white">
          {collapsed ? 'C' : 'Complya'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto py-3 px-2" aria-label="Navigation principale">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                collapsed ? 'justify-center px-2' : 'px-3',
                active
                  ? 'bg-blue-600/20 text-white'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className={clsx('border-t border-slate-800 p-2')}>
        <SignOutButton>
          <button
            title={collapsed ? 'Déconnexion' : undefined}
            className={clsx(
              'flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              collapsed ? 'justify-center px-2' : 'px-3',
            )}
          >
            <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}

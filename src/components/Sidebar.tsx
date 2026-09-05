'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileUp, Users, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export function Sidebar() {
  const pathname = usePathname();
  let user = null;
  let isLoaded = false;

  try {
    const clerkUser = useUser();
    user = clerkUser.user;
    isLoaded = clerkUser.isLoaded;
  } catch (e) {
    // Graceful fallback if Clerk context is loading
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: 'Home'
    },
    {
      name: 'Upload CV',
      href: '/upload',
      icon: FileUp,
      badge: 'AI Screen'
    },
    {
      name: 'Candidates',
      href: '/candidates',
      icon: Users,
      badge: 'Scored'
    },
    {
      name: 'Interviews',
      href: '/interviews',
      icon: CalendarCheck,
      badge: 'Schedule'
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between h-screen sticky top-0 z-30 shadow-xl">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              ScreenAI <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-medium">HR Pro</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Automated Candidate Screening</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* HR User Profile Card */}
      <div className="p-4 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLoaded && user ? (
              <UserButton afterSignOutUrl="/sign-in" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                HR
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {isLoaded && user ? user.fullName || user.primaryEmailAddress?.emailAddress : 'HR Manager'}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Authenticated HR
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

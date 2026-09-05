'use client';

import React from 'react';
import { Search, Bell, Sparkles, SlidersHorizontal, Mail, Slack } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case '/':
        return { title: 'HR Screening Dashboard', sub: 'Overview of AI CV screening metrics & shortlist' };
      case '/upload':
        return { title: 'Upload & Screen CVs', sub: 'Parse resumes against target job roles using AI' };
      case '/candidates':
        return { title: 'Candidate Database', sub: 'View ranked candidates, scores, and skills breakdowns' };
      case '/interviews':
        return { title: 'Interview Scheduler', sub: 'Manage upcoming interviews & send automatic invites' };
      default:
        return { title: 'HR Screening Dashboard', sub: 'Automated candidate evaluation platform' };
    }
  };

  const { title, sub } = getTitle();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Title & Context */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{sub}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Integrations Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Integrations Active:</span>
          <div className="flex items-center gap-1.5 text-slate-700 ml-1">
            <Slack className="w-3.5 h-3.5 text-emerald-600" />
            <Mail className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates or skills..."
            className="pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
          />
        </div>

        {/* AI Action Indicator */}
        <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-blue-500/20 cursor-default">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Scoring Ready</span>
        </div>
      </div>
    </header>
  );
}

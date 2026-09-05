'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, FileUp, Users, CalendarCheck, TrendingUp, CheckCircle2, ArrowRight, Award, Zap, AlertCircle } from 'lucide-react';
import { MOCK_CANDIDATES } from '@/lib/mock-data';
import { CandidateModal } from '@/components/CandidateModal';
import { InterviewModal } from '@/components/InterviewModal';
import { Candidate } from '@/lib/types';

export default function DashboardHome() {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);

  const totalScreened = candidates.length;
  const highMatches = candidates.filter(c => c.screening.matchCategory === 'High Match').length;
  const interviewsScheduled = candidates.filter(c => c.interview || c.status === 'Interview Scheduled').length;
  const avgScore = Math.round(candidates.reduce((acc, c) => acc + c.screening.score, 0) / (candidates.length || 1));

  const handleSaveInterview = (candidateId: string, interviewDetails: any) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId
          ? { ...c, status: 'Interview Scheduled', interview: interviewDetails }
          : c
      )
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Main Banner / Welcome Placeholder */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> AI Screening Active
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            HR Screening Dashboard
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Eliminate tedious manual resume screening. Automatically parse uploaded CVs, score candidate skill match using Gemini AI, and schedule interviews with 1-click Slack/Email notifications.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/upload"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload New CV</span>
            </Link>

            <Link
              href="/candidates"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>View Candidate Pool</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total CVs Screened</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalScreened}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% this week
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Match Pool</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{highMatches}</span>
            <span className="text-xs text-slate-500">Candidates &ge; 78% score</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interviews Booked</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{interviewsScheduled}</span>
            <span className="text-xs text-indigo-600 font-medium">Invites dispatched</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Match Score</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgScore}%</span>
            <span className="text-xs text-slate-500">Across active roles</span>
          </div>
        </div>

      </div>

      {/* Recent Screened Candidates Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Candidate Matches</h2>
            <p className="text-xs text-slate-500">Ranked automatically by AI skill match & experience evaluation</p>
          </div>

          <Link
            href="/candidates"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>See All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {candidates.slice(0, 3).map((candidate) => (
            <div key={candidate.id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{candidate.name}</h3>
                  <p className="text-xs text-slate-500">{candidate.targetRole}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {candidate.screening.matchedSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                        {skill}
                      </span>
                    ))}
                    {candidate.screening.matchedSkills.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{candidate.screening.matchedSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Score badge */}
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold ${
                    candidate.screening.score >= 78 ? 'bg-emerald-100 text-emerald-800' :
                    candidate.screening.score >= 55 ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {candidate.screening.score}% Match
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{candidate.screening.matchCategory}</span>
                </div>

                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onScheduleInterview={(cand) => setInterviewCandidate(cand)}
      />

      <InterviewModal
        candidate={interviewCandidate}
        onClose={() => setInterviewCandidate(null)}
        onSaveInterview={handleSaveInterview}
      />
    </div>
  );
}

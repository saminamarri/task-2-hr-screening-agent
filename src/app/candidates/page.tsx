'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Calendar, Sparkles, RefreshCw, CheckCircle2, Filter, ArrowUpDown, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_CANDIDATES } from '@/lib/mock-data';
import { CandidateModal } from '@/components/CandidateModal';
import { InterviewModal } from '@/components/InterviewModal';
import { Candidate } from '@/lib/types';

interface CandidateRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cv_text?: string;
  score: number | null;
  score_reasoning?: string | null;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview_scheduled' | string;
  created_at?: string;
  rawCandidateObj?: Candidate;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [screeningCandidateId, setScreeningCandidateId] = useState<string | null>(null);
  const [notifyingCandidateId, setNotifyingCandidateId] = useState<string | null>(null);
  const [screeningAlert, setScreeningAlert] = useState<{ id: string; name: string; score: number; status: string } | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ name: string; email: string; provider: string; gmailConfigured: boolean } | null>(null);

  const fetchCandidates = async () => {
    setIsLoading(true);
    let fetchedData: CandidateRow[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('score', { ascending: false, nullsFirst: false });

        if (!error && data && data.length > 0) {
          fetchedData = data.map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone || '',
            cv_text: item.cv_text || '',
            score: item.score,
            score_reasoning: item.score_reasoning,
            status: item.status,
            created_at: item.created_at
          }));
        }
      } catch (err) {
        console.warn('Error fetching from Supabase, using local state:', err);
      }
    }

    if (fetchedData.length === 0) {
      fetchedData = MOCK_CANDIDATES.map(cand => ({
        id: cand.id,
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        cv_text: cand.rawCvText,
        score: cand.screening.score,
        score_reasoning: cand.screening.summary,
        status: cand.status.toLowerCase() === 'shortlisted' ? 'shortlisted' :
                cand.status.toLowerCase() === 'rejected' ? 'rejected' :
                cand.status.toLowerCase() === 'interview scheduled' ? 'interview_scheduled' : 'pending',
        rawCandidateObj: cand
      }));
    }

    fetchedData.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    setCandidates(fetchedData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cand.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'shortlisted') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (s === 'rejected') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (s === 'interview_scheduled' || s === 'interview scheduled') return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const handleRunAiScreening = async (cand: CandidateRow) => {
    setScreeningCandidateId(cand.id);
    setScreeningAlert(null);

    try {
      const res = await fetch('/api/screen-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: cand.id,
          cvText: cand.cv_text || `${cand.name} resume. Full Stack Engineer experienced with React, Next.js, TypeScript, PostgreSQL, and Node.js.`
        })
      });

      const data = await res.json();

      if (data.success && data.result) {
        const { score, reasoning, status } = data.result;

        setCandidates(prev => {
          const updated = prev.map(c =>
            c.id === cand.id ? { ...c, score, score_reasoning: reasoning, status } : c
          );
          return updated.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        });

        setScreeningAlert({ id: cand.id, name: cand.name, score, status });
      }
    } catch (err) {
      console.error('Error running AI screening:', err);
    } finally {
      setScreeningCandidateId(null);
    }
  };

  const handleOneClickNotify = async (cand: CandidateRow) => {
    setNotifyingCandidateId(cand.id);
    setNotificationToast(null);

    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: cand.id,
          candidateName: cand.name,
          candidateEmail: cand.email,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
          customMessage: `Dear ${cand.name}, your candidate profile has been processed by our HR Screening Agent. We look forward to scheduling your interview!`
        })
      });

      const data = await res.json();
      if (data.success) {
        setCandidates(prev =>
          prev.map(c => c.id === cand.id ? { ...c, status: 'interview_scheduled' } : c)
        );

        const emailProvider = data.diagnostics?.emailProviderUsed || 'gmail_smtp';
        const isGmailConfigured = Boolean(data.diagnostics?.gmailUserSet && data.diagnostics?.gmailPassSet);

        setNotificationToast({
          name: cand.name,
          email: cand.email,
          provider: emailProvider,
          gmailConfigured: isGmailConfigured
        });
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setNotifyingCandidateId(null);
    }
  };

  const mapToCandidateModal = (row: CandidateRow): Candidate => {
    if (row.rawCandidateObj) return row.rawCandidateObj;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '+1 (555) 019-2831',
      appliedDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-09-07',
      targetRole: 'Senior Full Stack Engineer',
      status: row.status as any,
      fileName: 'Candidate_CV.pdf',
      rawCvText: row.cv_text,
      screening: {
        score: row.score ?? 0,
        matchCategory: (row.score ?? 0) >= 70 ? 'High Match' : (row.score ?? 0) >= 50 ? 'Medium Match' : 'Low Match',
        summary: row.score_reasoning || 'Evaluated candidate CV against role profile.',
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        missingSkills: (row.score ?? 0) < 70 ? ['GraphQL', 'Docker'] : [],
        strengths: ['Relevant SaaS development experience'],
        redFlags: (row.score ?? 0) < 50 ? ['Lacks required backend experience'] : [],
        recommendedRole: 'Software Engineer',
        yearsOfExperience: 4
      }
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Candidates Database</h1>
            <p className="text-xs text-slate-500">Sorted by score (highest first) &bull; 1-Click Gmail SMTP & Slack dispatches</p>
          </div>
        </div>

        <button
          onClick={fetchCandidates}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* 1-Click Notification Toast with Diagnostics */}
      {notificationToast && (
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl animate-in zoom-in duration-200 border border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">1-Click Notification Dispatched!</p>
              <p className="text-blue-200 text-xs mt-0.5">
                Sent email to <strong className="text-white">{notificationToast.email}</strong> via <span className="bg-blue-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{notificationToast.provider}</span> &bull; Gmail API Active: <span className={notificationToast.gmailConfigured ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>{notificationToast.gmailConfigured ? "YES" : "Pending Vercel Env Vars"}</span>
              </p>
            </div>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-xs font-bold text-blue-300 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Live AI Screening Alert */}
      {screeningAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in zoom-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Claude AI Screening Completed for <strong className="text-slate-900">{screeningAlert.name}</strong>: Score <strong className="text-emerald-700">{screeningAlert.score}%</strong> &rarr; Status updated to <span className="uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">{screeningAlert.status}</span>
            </span>
          </div>
          <button onClick={() => setScreeningAlert(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">pending (gray)</option>
            <option value="shortlisted">shortlisted (green)</option>
            <option value="rejected">rejected (red)</option>
            <option value="interview_scheduled">interview_scheduled (indigo)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold hidden lg:block whitespace-nowrap">
          Showing <span className="text-slate-900 font-bold">{filteredCandidates.length}</span> candidates
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6 flex items-center gap-1">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3 text-blue-600" />
                </th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Fetching candidates from Supabase...
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No candidates found matching status "{statusFilter}" or search term "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredCandidates.map(cand => {
                  const isShortlisted = cand.status.toLowerCase() === 'shortlisted';

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {cand.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {cand.email}
                      </td>

                      {/* Score */}
                      <td className="py-4 px-6">
                        {cand.score !== null && cand.score !== undefined ? (
                          <span className={`px-3 py-1 rounded-xl text-xs font-black inline-block shadow-sm ${
                            cand.score >= 70 ? 'bg-emerald-100 text-emerald-800' :
                            cand.score >= 50 ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {cand.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium italic">Unscored</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadge(cand.status)} uppercase tracking-wider`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {cand.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        
                        {/* 1-Click Notify Button */}
                        <button
                          onClick={() => handleOneClickNotify(cand)}
                          disabled={notifyingCandidateId === cand.id}
                          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                          title="1-Click Dispatch: Send Gmail SMTP Email & Slack Webhook alert"
                        >
                          {notifyingCandidateId === cand.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-blue-300" />
                              <span>1-Click Notify</span>
                            </>
                          )}
                        </button>

                        {/* Run AI Screening Button */}
                        <button
                          onClick={() => handleRunAiScreening(cand)}
                          disabled={screeningCandidateId === cand.id}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                          title="Run Claude AI Screening for this candidate"
                        >
                          {screeningCandidateId === cand.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Screening...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>AI Screen</span>
                            </>
                          )}
                        </button>

                        {/* Schedule Interview Button */}
                        {isShortlisted ? (
                          <button
                            onClick={() => setInterviewCandidate(mapToCandidateModal(cand))}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1 animate-pulse"
                            title="Schedule Interview slot for shortlisted candidate"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setInterviewCandidate(mapToCandidateModal(cand))}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all inline-flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Schedule</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedCandidate(mapToCandidateModal(cand))}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
        onSaveInterview={(id, scheduledTime) => {
          setCandidates(prev =>
            prev.map(c => c.id === id ? { ...c, status: 'interview_scheduled' } : c)
          );
        }}
      />
    </div>
  );
}

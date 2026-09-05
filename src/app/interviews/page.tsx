'use client';

import React, { useState } from 'react';
import { CalendarCheck, Video, Slack, Mail, Plus, UserCheck, Clock, ExternalLink } from 'lucide-react';
import { MOCK_CANDIDATES } from '@/lib/mock-data';
import { InterviewModal } from '@/components/InterviewModal';
import { Candidate } from '@/lib/types';

export default function InterviewsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedCandidateForSchedule, setSelectedCandidateForSchedule] = useState<Candidate | null>(null);

  const scheduledCandidates = candidates.filter(c => c.interview || c.status === 'Interview Scheduled');

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
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Scheduled Candidate Interviews</h1>
            <p className="text-xs text-slate-500">Track interview slots, video call links, and automated Slack/Email dispatches</p>
          </div>
        </div>

        <button
          onClick={() => setSelectedCandidateForSchedule(candidates[0])}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {/* Scheduled Interviews Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {scheduledCandidates.map((candidate) => {
          const interview = candidate.interview || {
            date: '2026-09-09',
            time: '11:00 EST',
            interviewer: 'Lead Recruiter',
            type: 'Technical',
            meetLink: 'https://meet.google.com/hr-interview-scheduled',
            slackNotified: true,
            emailNotified: true
          };

          return (
            <div key={candidate.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{candidate.name}</h3>
                    <p className="text-xs text-slate-500">{candidate.targetRole}</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl">
                  {interview.type} Round
                </span>
              </div>

              {/* Time & Interviewer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-blue-600" /> {interview.date} @ {interview.time}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> {interview.interviewer}
                  </span>
                </div>

                {interview.meetLink && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Video className="w-3.5 h-3.5 text-emerald-600" /> Google Meet Room
                    </span>
                    <a
                      href={interview.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Dispatched Notification Channels */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dispatched:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                      interview.slackNotified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Slack className="w-3 h-3 text-emerald-600" /> Slack Alert
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                      interview.emailNotified ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Mail className="w-3-h-3 text-blue-600" /> Email Invite
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidateForSchedule(candidate)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Reschedule
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal */}
      <InterviewModal
        candidate={selectedCandidateForSchedule}
        onClose={() => setSelectedCandidateForSchedule(null)}
        onSaveInterview={handleSaveInterview}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Calendar, Mail, Phone, Award, Brain, FileText, ArrowRight } from 'lucide-react';
import { Candidate } from '@/lib/types';

interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onScheduleInterview: (candidate: Candidate) => void;
}

export function CandidateModal({ candidate, onClose, onScheduleInterview }: CandidateModalProps) {
  if (!candidate) return null;

  const { screening } = candidate;

  const getScoreBadge = (score: number) => {
    if (score >= 78) return 'bg-emerald-500 text-white shadow-emerald-500/20';
    if (score >= 55) return 'bg-amber-500 text-white shadow-amber-500/20';
    return 'bg-rose-500 text-white shadow-rose-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                <p className="text-xs text-slate-300 font-medium">{candidate.targetRole}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-400" /> {candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-400" /> {candidate.phone}</span>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-end">
              <div className={`px-4 py-2 rounded-2xl font-black text-2xl shadow-lg ${getScoreBadge(screening.score)}`}>
                {screening.score}%
              </div>
              <span className="text-[11px] font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                {screening.matchCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Executive Summary */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-600" /> AI Executive Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {screening.summary}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
              <span className="text-xs text-blue-600 font-semibold block">Experience</span>
              <span className="text-lg font-bold text-blue-950">{screening.yearsOfExperience} Years</span>
            </div>
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center">
              <span className="text-xs text-indigo-600 font-semibold block">Matched Skills</span>
              <span className="text-lg font-bold text-indigo-950">{screening.matchedSkills.length} Verified</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-xs text-slate-500 font-semibold block">Recommended Role</span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-1">{screening.recommendedRole}</span>
            </div>
          </div>

          {/* Matched & Missing Skills */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Skills ({screening.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {screening.matchedSkills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-rose-500" /> Missing Skills ({screening.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {screening.missingSkills.length > 0 ? (
                  screening.missingSkills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-semibold rounded-lg">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None - All core skills present!</span>
                )}
              </div>
            </div>
          </div>

          {/* Key Strengths & Red Flags */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-500" /> Key Strengths
              </h4>
              <ul className="space-y-1.5">
                {screening.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {screening.redFlags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Red Flags / Gap Areas
                </h4>
                <ul className="space-y-1.5">
                  {screening.redFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-rose-600 flex items-start gap-2 bg-rose-50/60 p-2 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Raw CV Preview snippet */}
          {candidate.rawCvText && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-400" /> Resume Excerpt ({candidate.fileName})
              </h4>
              <div className="p-3 bg-slate-900 text-slate-300 font-mono text-xs rounded-xl max-h-32 overflow-y-auto leading-relaxed">
                {candidate.rawCvText}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onScheduleInterview(candidate);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

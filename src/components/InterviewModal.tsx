'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, UserCheck, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { Candidate } from '@/lib/types';

interface InterviewModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onSaveInterview: (candidateId: string, scheduledTime: string) => void;
}

export function InterviewModal({ candidate, onClose, onSaveInterview }: InterviewModalProps) {
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ label: string; value: string }[]>([
    { label: 'Tomorrow at 10:00 AM EST', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T10:00:00Z' },
    { label: 'Tomorrow at 02:00 PM EST', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00Z' },
    { label: 'Day After at 11:00 AM EST', value: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T11:00:00Z' },
    { label: 'Day After at 04:00 PM EST', value: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T16:00:00Z' },
  ]);
  const [selectedSlot, setSelectedSlot] = useState<string>(availableSlots[0].value);
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfferedCreated, setIsOfferedCreated] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // When candidate modal opens, create row in "interviews" table with status "offered"
  useEffect(() => {
    if (candidate) {
      const createInterviewOffer = async () => {
        try {
          const res = await fetch('/api/schedule-interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'offer',
              candidateId: candidate.id,
              candidateName: candidate.name,
              candidateEmail: candidate.email
            })
          });
          const data = await res.json();
          if (data.success) {
            setInterviewId(data.interviewId);
            if (data.availableSlots) {
              setAvailableSlots(data.availableSlots);
              setSelectedSlot(data.availableSlots[0].value);
            }
            setIsOfferedCreated(true);
          }
        } catch (err) {
          console.warn('Error creating interview offer:', err);
        }
      };

      createInterviewOffer();
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalScheduledTime = customDateTime ? new Date(customDateTime).toISOString() : selectedSlot;

    try {
      const res = await fetch('/api/schedule-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          candidateId: candidate.id,
          interviewId: interviewId,
          scheduledTime: finalScheduledTime,
          candidateName: candidate.name,
          candidateEmail: candidate.email
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        onSaveInterview(candidate.id, finalScheduledTime);
        setSentSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setSentSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Schedule Interview Slot</h2>
              <p className="text-xs text-slate-300">Candidate: <span className="text-blue-400 font-semibold">{candidate.name}</span></p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {sentSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interview Slot Confirmed!</h3>
              <p className="text-xs text-slate-500">
                Supabase <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">interviews</code> table updated to status <strong>"confirmed"</strong> & candidate status set to <strong>"interview_scheduled"</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1 notification */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Interview record created in Supabase with status <strong className="uppercase text-blue-700 font-extrabold">"offered"</strong>.
                </span>
              </div>

              {/* Step 2 & 3: Select 3-5 Available Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Select Available Time Slot (3-5 Slots)
                </label>
                <div className="space-y-2">
                  {availableSlots.map((slot, idx) => (
                    <label
                      key={idx}
                      onClick={() => {
                        setSelectedSlot(slot.value);
                        setCustomDateTime('');
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedSlot === slot.value && !customDateTime
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{slot.label}</span>
                      <input
                        type="radio"
                        name="timeSlot"
                        checked={selectedSlot === slot.value && !customDateTime}
                        onChange={() => {
                          setSelectedSlot(slot.value);
                          setCustomDateTime('');
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Or Custom Date Time Picker */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or Pick Custom Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Slot & Update Status</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
}

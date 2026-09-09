'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, FileText, User, Mail, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<{
    candidateId: string;
    name: string;
    email: string;
    status: string;
    fileName: string;
    cv_text: string;
    extractedLength: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please fill in candidate name and email.');
      return;
    }
    if (!file) {
      setErrorMessage('Please select a PDF or DOCX file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('file', file);

      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload and parse CV.');
      }

      const uploadedCandidateObj = {
        candidateId: data.candidate.id,
        name: data.candidate.name,
        email: data.candidate.email,
        status: data.candidate.status,
        fileName: data.candidate.fileName,
        cv_text: data.candidate.cv_text,
        extractedLength: data.candidate.extractedLength
      };

      setUploadSuccess(uploadedCandidateObj);

      // Guarantee persistence by saving newly uploaded candidate to localStorage
      try {
        const existingStr = localStorage.getItem('local_uploaded_candidates');
        const existingArr: any[] = existingStr ? JSON.parse(existingStr) : [];
        const updatedArr = [
          {
            id: data.candidate.id || `cand-${Date.now()}`,
            name: data.candidate.name,
            email: data.candidate.email,
            cv_text: data.candidate.cv_text,
            score: null,
            score_reasoning: null,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          ...existingArr.filter((c: any) => c.email.toLowerCase() !== data.candidate.email.toLowerCase())
        ];
        localStorage.setItem('local_uploaded_candidates', JSON.stringify(updatedArr));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // Reset form
      setName('');
      setEmail('');
      setFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Upload Candidate CV</h1>
            <p className="text-xs text-slate-500">Extract plain text from PDF/DOCX and register in Supabase database</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Status: Pending Persistence Active</span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in zoom-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950">CV Uploaded & Saved Successfully!</h2>
              <p className="text-xs text-emerald-700">
                Candidate record created in Supabase <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">candidates</code> table with status <span className="font-extrabold uppercase text-emerald-900">"{uploadSuccess.status}"</span>.
              </p>
            </div>
          </div>

          {/* Candidate Card Summary */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Candidate Name</span>
              <span className="font-bold text-slate-900 text-sm">{uploadSuccess.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email Address</span>
              <span className="font-semibold text-slate-800">{uploadSuccess.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Uploaded Document</span>
              <span className="font-semibold text-blue-600 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {uploadSuccess.fileName} ({uploadSuccess.extractedLength} chars)
              </span>
            </div>
          </div>

          {/* Extracted Text Snippet */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono max-h-36 overflow-y-auto leading-relaxed border border-slate-800">
            <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
              <span>Extracted Plain Text (pdf-parse / mammoth)</span>
              <span>Length: {uploadSuccess.extractedLength} chars</span>
            </div>
            {uploadSuccess.cv_text}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setUploadSuccess(null)}
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition-colors"
            >
              Upload Another CV
            </button>
            <Link
              href="/candidates"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>View Candidates Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Candidate Details Inputs */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> Candidate Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Candidate Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. jane.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* File Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Upload Resume Document *</span>
            <span className="text-[11px] font-semibold text-blue-600">PDF (.pdf) or Word (.docx)</span>
          </label>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500/60 hover:bg-blue-50/20 transition-all group relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              required={!file}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition-colors mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">
              {file ? (
                <span className="text-blue-600 font-extrabold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                'Choose a PDF or DOCX file to upload'
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports automatic text extraction with <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">pdf-parse</code> & <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">mammoth</code>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !name.trim() || !email.trim() || !file}
          className={`w-full py-4 rounded-2xl font-bold text-xs text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
            isUploading || !name.trim() || !email.trim() || !file
              ? 'bg-slate-300 shadow-none cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30 transform hover:-translate-y-0.5'
          }`}
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Extracting Text & Saving Candidate to Supabase...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Upload CV & Save to Supabase (Status: Pending)</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}

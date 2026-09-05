import { NextResponse } from 'next/server';
import { parseCvText } from '@/lib/cv-parser';
import { scoreCandidateWithAI } from '@/lib/ai-scoring';
import { MOCK_JOBS } from '@/lib/mock-data';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cvText, fileName, jobId, candidateName, candidateEmail } = body;

    if (!cvText || cvText.trim().length === 0) {
      return NextResponse.json({ error: 'CV content is empty' }, { status: 400 });
    }

    const jobRole = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];

    // 1. Parse CV
    const parsedCv = parseCvText(cvText, fileName);

    if (candidateName) parsedCv.extractedName = candidateName;
    if (candidateEmail) parsedCv.extractedEmail = candidateEmail;

    // 2. AI Scoring
    const screeningResult = await scoreCandidateWithAI(parsedCv, jobRole);

    const candidateNameFinal = parsedCv.extractedName || candidateName || 'Uploaded Candidate';
    const candidateEmailFinal = parsedCv.extractedEmail || candidateEmail || 'candidate@example.com';
    const candidatePhoneFinal = parsedCv.extractedPhone || '+1 (555) 019-2831';

    let dbCandidateId = `cand-${Date.now().toString().slice(-4)}`;

    // 3. Persist to Supabase candidates table if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseServer
          .from('candidates')
          .insert({
            name: candidateNameFinal,
            email: candidateEmailFinal,
            phone: candidatePhoneFinal,
            cv_text: cvText,
            score: screeningResult.score,
            score_reasoning: screeningResult.summary,
            status: screeningResult.score >= 78 ? 'shortlisted' : 'pending'
          })
          .select()
          .single();

        if (!error && data) {
          dbCandidateId = data.id;
        }
      } catch (err) {
        console.warn('Supabase insert skipped:', err);
      }
    }

    const newCandidate = {
      id: dbCandidateId,
      name: candidateNameFinal,
      email: candidateEmailFinal,
      phone: candidatePhoneFinal,
      appliedDate: new Date().toISOString().split('T')[0],
      targetRole: jobRole.title,
      status: (screeningResult.score >= 78 ? 'Shortlisted' : 'Screened') as any,
      fileName: fileName || 'Uploaded_CV.txt',
      rawCvText: cvText,
      screening: screeningResult
    };

    return NextResponse.json({
      success: true,
      candidate: newCandidate
    });
  } catch (error: any) {
    console.error('Error screening CV:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

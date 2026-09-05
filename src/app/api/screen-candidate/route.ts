import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { sendSlackShortlistNotification } from '@/lib/notifications';

const DEFAULT_JOB_DESCRIPTION = `
Position: Senior Full Stack Software Engineer
Department: Engineering

Job Summary:
We are seeking an experienced Senior Full Stack Engineer to lead front-end and back-end SaaS development.

Requirements:
- 4+ years of professional software engineering experience.
- Strong proficiency with React, Next.js 14, TypeScript, and Node.js.
- Database expertise with PostgreSQL, Supabase, and SQL schema design.
- Hands-on experience with Tailwind CSS, RESTful APIs, and Clerk authentication.
- Familiarity with AI/LLM API integrations (Claude / OpenAI / Gemini).
`;

interface ClaudeScreeningResponse {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  reasoning: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, cvText, jobDescription = DEFAULT_JOB_DESCRIPTION } = body;

    if (!cvText || cvText.trim().length === 0) {
      return NextResponse.json({ error: 'Candidate CV text is missing or empty.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let parsedResult: ClaudeScreeningResponse;

    // Call Anthropic Claude API if valid key is present
    if (apiKey && !apiKey.includes('placeholder') && apiKey.trim() !== '') {
      try {
        const anthropic = new Anthropic({ apiKey });

        const prompt = `
You are an expert HR Candidate Screening Assistant.
Analyze the following candidate resume text against the provided Job Description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME TEXT:
${cvText}

Return ONLY valid JSON in this format EXACTLY (no markdown formatting, no backticks, plain JSON object only):
{
  "score": number,
  "matched_skills": string[],
  "missing_skills": string[],
  "reasoning": string
}
`;

        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        });

        const rawContent = message.content[0]?.type === 'text' ? message.content[0].text : '';
        const cleanJsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleanJsonStr);
      } catch (claudeErr: any) {
        console.warn('Anthropic Claude API call skipped/failed, using fallback rule evaluation:', claudeErr);
        parsedResult = runFallbackEvaluation(cvText, jobDescription);
      }
    } else {
      parsedResult = runFallbackEvaluation(cvText, jobDescription);
    }

    // Determine status: "shortlisted" if score >= 70, otherwise "rejected"
    const isShortlisted = parsedResult.score >= 70;
    const newStatus: 'shortlisted' | 'rejected' = isShortlisted ? 'shortlisted' : 'rejected';

    let candidateName = 'Candidate';

    // Update candidate row in Supabase
    if (isSupabaseConfigured() && candidateId) {
      try {
        const { data, error } = await supabaseServer
          .from('candidates')
          .update({
            score: parsedResult.score,
            score_reasoning: parsedResult.reasoning,
            status: newStatus
          })
          .eq('id', candidateId)
          .select()
          .single();

        if (!error && data) {
          candidateName = data.name || candidateName;
        }
      } catch (dbErr) {
        console.warn('Supabase DB update skipped:', dbErr);
      }
    }

    // 1. Send Slack Notification if Candidate is Shortlisted (score >= 70)
    // Message: "New candidate shortlisted: [Name] - Score: [Score]"
    if (isShortlisted) {
      await sendSlackShortlistNotification({
        candidateName,
        score: parsedResult.score
      });
    }

    return NextResponse.json({
      success: true,
      candidateId,
      result: {
        score: parsedResult.score,
        matched_skills: parsedResult.matched_skills,
        missing_skills: parsedResult.missing_skills,
        reasoning: parsedResult.reasoning,
        status: newStatus,
        slackNotificationSent: isShortlisted
      }
    });
  } catch (error: any) {
    console.error('Error in candidate AI screening:', error);
    return NextResponse.json({ error: error.message || 'Error processing AI screening.' }, { status: 500 });
  }
}

function runFallbackEvaluation(cvText: string, jobDescription: string): ClaudeScreeningResponse {
  const reqSkills = ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind', 'Clerk', 'API'];
  const textLower = cvText.toLowerCase();

  const matched = reqSkills.filter(skill => textLower.includes(skill.toLowerCase()));
  const missing = reqSkills.filter(skill => !matched.includes(skill));

  const score = Math.min(95, Math.max(35, Math.round((matched.length / reqSkills.length) * 100)));
  const statusStr = score >= 70 ? 'shortlisted' : 'rejected';

  const reasoning = `Candidate matched ${matched.length} of ${reqSkills.length} core engineering skills (${matched.join(', ')}). Overall calculated fit score is ${score}%, resulting in candidate status: ${statusStr}.`;

  return {
    score,
    matched_skills: matched,
    missing_skills: missing,
    reasoning
  };
}

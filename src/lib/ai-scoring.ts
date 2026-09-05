import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScreeningResult, MatchCategory, JobRole } from './types';
import { ParsedCv } from './cv-parser';

export async function scoreCandidateWithAI(
  parsedCv: ParsedCv,
  jobRole: JobRole
): Promise<ScreeningResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are an expert HR Candidate Screening AI Agent.
Analyze the following Candidate Resume against the Job Description.

JOB TITLE: ${jobRole.title}
DEPARTMENT: ${jobRole.department}
REQUIRED SKILLS: ${jobRole.requiredSkills.join(', ')}
PREFERRED SKILLS: ${jobRole.preferredSkills.join(', ')}
MINIMUM EXPERIENCE YEARS: ${jobRole.minExperienceYears}
JOB DESCRIPTION: ${jobRole.description}

CANDIDATE RESUME TEXT:
${parsedCv.text}

Return a valid JSON object matching this structure EXACTLY (no markdown formatting, plain JSON only):
{
  "score": number (0 to 100 integer),
  "matchCategory": "High Match" | "Medium Match" | "Low Match",
  "summary": "2-3 sentences concise executive summary of the candidate fit",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength 1", "strength 2"],
  "redFlags": ["red flag 1 if any"],
  "recommendedRole": "String title",
  "yearsOfExperience": number
}
`;

      const response = await model.generateContent(prompt);
      const rawText = response.response.text() || '';
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      return {
        score: Math.min(100, Math.max(0, parsed.score || 70)),
        matchCategory: parsed.matchCategory || (parsed.score >= 80 ? 'High Match' : parsed.score >= 60 ? 'Medium Match' : 'Low Match'),
        summary: parsed.summary || 'Candidate evaluated successfully.',
        matchedSkills: parsed.matchedSkills || [],
        missingSkills: parsed.missingSkills || [],
        strengths: parsed.strengths || [],
        redFlags: parsed.redFlags || [],
        recommendedRole: parsed.recommendedRole || jobRole.title,
        yearsOfExperience: parsed.yearsOfExperience || parsedCv.estimatedExperienceYears
      };
    } catch (err) {
      console.warn('Gemini API call skipped or failed, falling back to local AI scoring engine:', err);
    }
  }

  // --- Fallback AI Scoring Engine (Smart Match Rules) ---
  const reqSkills = jobRole.requiredSkills;
  const prefSkills = jobRole.preferredSkills;
  const cvSkills = parsedCv.extractedSkills;

  const matchedReq = reqSkills.filter(s =>
    cvSkills.some(cs => cs.toLowerCase() === s.toLowerCase()) ||
    parsedCv.text.toLowerCase().includes(s.toLowerCase())
  );

  const missingReq = reqSkills.filter(s => !matchedReq.includes(s));

  const matchedPref = prefSkills.filter(s =>
    cvSkills.some(cs => cs.toLowerCase() === s.toLowerCase()) ||
    parsedCv.text.toLowerCase().includes(s.toLowerCase())
  );

  // Score Calculation
  const reqRatio = reqSkills.length > 0 ? (matchedReq.length / reqSkills.length) : 1;
  const prefRatio = prefSkills.length > 0 ? (matchedPref.length / prefSkills.length) : 0.5;
  const expMatchRatio = Math.min(1, parsedCv.estimatedExperienceYears / (jobRole.minExperienceYears || 1));

  let score = Math.round((reqRatio * 65) + (prefRatio * 20) + (expMatchRatio * 15));
  score = Math.min(98, Math.max(25, score));

  let matchCategory: MatchCategory = 'Medium Match';
  if (score >= 78) matchCategory = 'High Match';
  else if (score < 55) matchCategory = 'Low Match';

  const strengths: string[] = [];
  if (matchedReq.length > 0) strengths.push(`Strong match on key skills: ${matchedReq.join(', ')}`);
  if (parsedCv.estimatedExperienceYears >= jobRole.minExperienceYears) {
    strengths.push(`Meets experience requirement (${parsedCv.estimatedExperienceYears} yrs vs ${jobRole.minExperienceYears} yrs required)`);
  }
  if (matchedPref.length > 0) {
    strengths.push(`Bonus background in: ${matchedPref.join(', ')}`);
  }

  const redFlags: string[] = [];
  if (missingReq.length > 2) {
    redFlags.push(`Missing core skills: ${missingReq.join(', ')}`);
  }
  if (parsedCv.estimatedExperienceYears < jobRole.minExperienceYears) {
    redFlags.push(`Below target experience level (${parsedCv.estimatedExperienceYears} yrs vs ${jobRole.minExperienceYears} yrs target)`);
  }

  const summary = `${parsedCv.extractedName || 'Candidate'} scores ${score}% match for ${jobRole.title}. Demonstrates ${matchedReq.length} of ${reqSkills.length} required skills with approximately ${parsedCv.estimatedExperienceYears} years of relevant experience.`;

  return {
    score,
    matchCategory,
    summary,
    matchedSkills: [...matchedReq, ...matchedPref],
    missingSkills: missingReq,
    strengths: strengths.length > 0 ? strengths : ['General software engineering experience'],
    redFlags,
    recommendedRole: jobRole.title,
    yearsOfExperience: parsedCv.estimatedExperienceYears
  };
}

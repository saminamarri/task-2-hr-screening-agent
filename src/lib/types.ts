export type MatchCategory = 'High Match' | 'Medium Match' | 'Low Match';

export type CandidateStatus = 
  | 'pending' 
  | 'shortlisted' 
  | 'rejected' 
  | 'interview_scheduled' 
  | 'Screened' 
  | 'Shortlisted' 
  | 'Interview Scheduled' 
  | 'Rejected' 
  | 'Hired';

export type InterviewStatus = 'offered' | 'confirmed' | 'completed';

/**
 * Supabase Database Table Schema Types
 */
export interface DbCandidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cv_text: string | null;
  score: number | null;
  score_reasoning: string | null;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview_scheduled';
  created_at: string;
}

export interface DbInterview {
  id: string;
  candidate_id: string;
  scheduled_time: string | null;
  status: 'offered' | 'confirmed' | 'completed';
  created_at: string;
}

export interface SkillMatch {
  skill: string;
  matched: boolean;
  proficiency?: string;
}

export interface ScreeningResult {
  score: number; // 0 - 100
  matchCategory: MatchCategory;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  redFlags: string[];
  recommendedRole: string;
  yearsOfExperience: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  targetRole: string;
  status: CandidateStatus;
  screening: ScreeningResult;
  rawCvText?: string;
  fileName?: string;
  interview?: {
    date: string;
    time: string;
    interviewer: string;
    type: 'Technical' | 'HR Culture' | 'Final Round';
    meetLink?: string;
    slackNotified: boolean;
    emailNotified: boolean;
  };
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  description: string;
}

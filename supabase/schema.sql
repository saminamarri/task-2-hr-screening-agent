-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create candidate status enum
CREATE TYPE candidate_status AS ENUM (
  'pending',
  'shortlisted',
  'rejected',
  'interview_scheduled'
);

-- Create interview status enum
CREATE TYPE interview_status AS ENUM (
  'offered',
  'confirmed',
  'completed'
);

-- 1. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_text TEXT,
  score INTEGER,
  score_reasoning TEXT,
  status candidate_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ,
  status interview_status NOT NULL DEFAULT 'offered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Indexes for performant querying
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(score DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);

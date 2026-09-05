import { Candidate, JobRole } from './types';

export const MOCK_JOBS: JobRole[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React/Node.js)',
    department: 'Engineering',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS'],
    preferredSkills: ['GraphQL', 'Docker', 'AWS', 'Clerk', 'LLM Integration'],
    minExperienceYears: 4,
    description: 'We are looking for a Senior Full Stack Engineer to lead front-end and back-end development for our core SaaS product.'
  },
  {
    id: 'job-2',
    title: 'AI / Machine Learning Engineer',
    department: 'AI Lab',
    requiredSkills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'Transformers', 'FastAPI'],
    preferredSkills: ['Vector DBs', 'Fine-tuning', 'RAG Architecture'],
    minExperienceYears: 3,
    description: 'Build cutting edge generative AI agents and workflows integrated with enterprise data systems.'
  },
  {
    id: 'job-3',
    title: 'Product Designer (UI/UX)',
    department: 'Design',
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Design Systems', 'Prototyping'],
    preferredSkills: ['HTML/CSS', 'Micro-animations', 'Accessibility (a11y)'],
    minExperienceYears: 3,
    description: 'Design intuitive interfaces and seamless candidate onboarding experiences.'
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-101',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@devtech.com',
    phone: '+1 (555) 234-5678',
    appliedDate: '2026-09-02',
    targetRole: 'Senior Full Stack Engineer (React/Node.js)',
    status: 'Shortlisted',
    fileName: 'Sarah_Jenkins_Resume_2026.pdf',
    rawCvText: 'Senior Full Stack Engineer with 6 years experience in building high performance React, Next.js 14, TypeScript, Node.js applications and PostgreSQL databases. Integrated Clerk auth and AWS cloud services.',
    screening: {
      score: 94,
      matchCategory: 'High Match',
      summary: 'Exceptional candidate with extensive Next.js, React, Node.js and TypeScript expertise matching 95% of job requirements.',
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS', 'AWS', 'Clerk'],
      missingSkills: ['GraphQL'],
      strengths: ['6+ years full stack experience', 'Strong architecture skills', 'Hands-on Clerk auth experience'],
      redFlags: [],
      recommendedRole: 'Senior Full Stack Engineer',
      yearsOfExperience: 6
    }
  },
  {
    id: 'cand-102',
    name: 'Marcus Vance',
    email: 'marcus.vance@ai-labs.org',
    phone: '+1 (555) 876-5432',
    appliedDate: '2026-09-03',
    targetRole: 'AI / Machine Learning Engineer',
    status: 'Interview Scheduled',
    fileName: 'Marcus_Vance_AI_CV.pdf',
    rawCvText: 'AI Research Engineer with 4 years experience deploying LLM agents using Python, PyTorch, LangChain, OpenAI APIs, and Vector databases.',
    screening: {
      score: 89,
      matchCategory: 'High Match',
      summary: 'Solid background in AI agent development and LLM prompt engineering with PyTorch and LangChain.',
      matchedSkills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'FastAPI', 'Vector DBs', 'RAG Architecture'],
      missingSkills: ['Transformers'],
      strengths: ['Deep experience in RAG and Vector DBs', 'Built multi-agent frameworks'],
      redFlags: [],
      recommendedRole: 'AI / Machine Learning Engineer',
      yearsOfExperience: 4
    },
    interview: {
      date: '2026-09-08',
      time: '14:00 EST',
      interviewer: 'David Ross (Head of AI)',
      type: 'Technical',
      meetLink: 'https://meet.google.com/hr-screening-mv',
      slackNotified: true,
      emailNotified: true
    }
  },
  {
    id: 'cand-103',
    name: 'Elena Rostova',
    email: 'elena.rostova@designflow.io',
    phone: '+1 (555) 345-6789',
    appliedDate: '2026-09-04',
    targetRole: 'Product Designer (UI/UX)',
    status: 'Screened',
    fileName: 'Elena_Rostova_Design_Portfolio.pdf',
    rawCvText: 'Lead UX/UI Designer with 5 years crafting complex enterprise dashboard systems using Figma, Design Systems, and Prototyping.',
    screening: {
      score: 82,
      matchCategory: 'High Match',
      summary: 'Strong visual UI/UX designer with enterprise dashboard expertise in Figma and Design System systems.',
      matchedSkills: ['Figma', 'User Research', 'Wireframing', 'Design Systems', 'Prototyping', 'Accessibility (a11y)'],
      missingSkills: ['HTML/CSS'],
      strengths: ['Comprehensive portfolio', 'Enterprise SaaS UI experience'],
      redFlags: [],
      recommendedRole: 'Product Designer',
      yearsOfExperience: 5
    }
  },
  {
    id: 'cand-104',
    name: 'Kevin Zhao',
    email: 'kevin.zhao@webdev.net',
    phone: '+1 (555) 901-2345',
    appliedDate: '2026-09-01',
    targetRole: 'Senior Full Stack Engineer (React/Node.js)',
    status: 'Screened',
    fileName: 'Kevin_Zhao_Resume.pdf',
    rawCvText: 'Frontend developer with 2 years experience building basic React websites using Javascript and HTML.',
    screening: {
      score: 48,
      matchCategory: 'Low Match',
      summary: 'Junior frontend developer lacking required backend experience (Node.js, PostgreSQL) and TypeScript experience required for senior role.',
      matchedSkills: ['React'],
      missingSkills: ['TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS'],
      strengths: ['Basic React knowledge'],
      redFlags: ['Under-qualified for Senior designation (2 yrs vs 4+ yrs required)'],
      recommendedRole: 'Junior Frontend Developer',
      yearsOfExperience: 2
    }
  }
];

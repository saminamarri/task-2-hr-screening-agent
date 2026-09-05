/**
 * Parser utility for candidate CVs (PDF, TXT, DOCX text content)
 */

export interface ParsedCv {
  text: string;
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  extractedSkills: string[];
  estimatedExperienceYears: number;
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'PyTorch', 'TensorFlow', 'LangChain',
  'OpenAI API', 'LLM Integration', 'PostgreSQL', 'MongoDB', 'GraphQL',
  'REST API', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Tailwind CSS', 'Figma', 'UI/UX', 'CI/CD', 'Git', 'Agile', 'Clerk'
];

export function parseCvText(rawContent: string, fileName?: string): ParsedCv {
  const cleanText = rawContent.replace(/\r\n/g, '\n').trim();

  // Extract Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i;
  const emailMatch = cleanText.match(emailRegex);
  const extractedEmail = emailMatch ? emailMatch[1] : undefined;

  // Extract Phone Number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = cleanText.match(phoneRegex);
  const extractedPhone = phoneMatch ? phoneMatch[0] : undefined;

  // Extract Candidate Name from top lines or filename
  let extractedName: string | undefined;
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
    extractedName = lines[0];
  } else if (fileName) {
    extractedName = fileName.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');
  }

  // Extract Skills matching dictionary
  const foundSkills: string[] = [];
  const textLower = cleanText.toLowerCase();
  for (const skill of COMMON_SKILLS) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  // Estimate experience years
  const expMatch = textLower.match(/(\d+)\+?\s*(years|yrs)\s*(of)?\s*(experience|exp)/i);
  let estimatedExperienceYears = 3;
  if (expMatch && expMatch[1]) {
    estimatedExperienceYears = parseInt(expMatch[1], 10);
  }

  return {
    text: cleanText,
    extractedName,
    extractedEmail,
    extractedPhone,
    extractedSkills: foundSkills,
    estimatedExperienceYears
  };
}

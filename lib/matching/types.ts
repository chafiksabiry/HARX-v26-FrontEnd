// Types for the matching system

export interface Skill {
  _id: string;
  name: string;
  category?: 'professional' | 'technical' | 'soft';
}

export interface Language {
  _id: string;
  name: string;
  code: string;
  nativeName?: string;
}

export interface Rep {
  _id: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: {
      country: string;
      city?: string;
      timezone?: string;
    };
  };
  professionalProfile?: {
    skills: Array<{ skillId: string | Skill; level: string }>;
    languages: Array<{ languageId: string | Language; proficiency: string }>;
    experience: Array<any>;
    overview?: string;
  };
  status?: string;
  availability?: any;
}

export interface Gig {
  _id?: string;
  title: string;
  description: string;
  companyId: string;
  companyName?: string;
  category: string;
  status: string;
  requirements: {
    skills: Array<{ skillId: string; level: string; importance: string }>;
    languages: Array<{ languageId: string; proficiency: string; importance: string }>;
    experience?: number;
    education?: string;
  };
  schedule?: {
    timezone: string;
    hoursPerWeek: number;
  };
  compensation?: {
    min: number;
    max: number;
    currency: string;
    type: string;
  };
  location?: {
    type: string;
    regions?: string[];
  };
}

export interface MatchingWeights {
  experience: number;
  skills: number;
  industry: number;
  languages: number;
  availability: number;
  timezone: number;
  activities: number;
  region: number;
}

export interface MatchScore {
  score: number;
  details?: any;
  explanation?: string[];
}

export interface Match {
  agentId: string;
  agentInfo?: Rep;
  gigId?: string;
  totalMatchingScore: number;
  skillsMatch?: MatchScore;
  languageMatch?: MatchScore;
  industryMatch?: MatchScore;
  activityMatch?: MatchScore;
  experienceMatch?: MatchScore;
  timezoneMatch?: MatchScore;
  regionMatch?: MatchScore;
  availabilityMatch?: MatchScore;
  isInvited?: boolean;
}


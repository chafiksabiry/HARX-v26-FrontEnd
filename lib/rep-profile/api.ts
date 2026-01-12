import api from './client';

export const getProfile = async (userId?: string) => {
  try {
    // If userId is provided, use it to fetch a specific profile
    // In our backend implementation, GET /profiles uses req.user.userId anyway
    // But let's keep the signature
    const endpoint = userId ? `/profiles/${userId}` : '/profiles';
    
    // Check if API URL is configured
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    console.log('Fetching profile from:', `${API_URL}${endpoint}`);
    
    const { data } = await api.get(endpoint);
    
    // Handle response structure
    if (data && data.success && data.data) {
      return data.data;
    }
    return data;
  } catch (error: any) {
    // Handle network errors (backend not running or unreachable)
    if (!error.response) {
      console.error(`Network error fetching profile${userId ? ` for user ${userId}` : ''}:`, error.message);
      console.error('This usually means the backend server is not running or not accessible.');
      console.error('Please ensure the backend is running on', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
      // Return null for network errors to allow the app to continue
      return null;
    }
    
    // If profile not found (404), return null instead of throwing error
    // This is a normal case for users who haven't created a profile yet
    if (error.response?.status === 404) {
      return null;
    }
    
    // Only log and throw for other errors
    console.error(`Error fetching profile${userId ? ` for user ${userId}` : ''}:`, error);
    throw error.response?.data || error;
  }
};

export const createProfile = async (profileData: any) => {
  try {
    const { data } = await api.post('/profiles', profileData);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateBasicInfo = async (id: string, basicInfo: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/basic-info`, basicInfo);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateExperience = async (id: string, experience: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/experience`, { experience });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateSkills = async (id: string, skills: any) => {
  try {
    const { data } = await api.put(`/profiles/${id}/skills`, { skills });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (id: string, profileData: any) => {
  try {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Extract basic information from CV
export const extractBasicInfo = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/extract-basic-info', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error extracting basic info from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze work experience from CV
export const analyzeExperience = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-experience', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing work experience from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze skills and languages from CV
export const analyzeSkills = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-skills', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing skills from CV:', error);
    throw error.response?.data || error;
  }
};

// Extract achievements from CV
export const analyzeAchievements = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-achievements', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing achievements from CV:', error);
    throw error.response?.data || error;
  }
};

// Analyze availability from CV
export const analyzeAvailability = async (contentToProcess: string) => {
  try {
    const { data } = await api.post('/cv/analyze-availability', { contentToProcess });
    return data;
  } catch (error: any) {
    console.error('Error analyzing availability from CV:', error);
    throw error.response?.data || error;
  }
};

// Generate CV summary
export const generateSummary = async (profileData: any) => {
  try {
    const { data } = await api.post('/cv/generate-summary', { profileData });
    return data;
  } catch (error: any) {
    console.error('Error generating CV summary:', error);
    throw error.response?.data || error;
  }
};

export const getLanguageByCode = async (code: string) => {
    try {
        const { data } = await api.get('/languages');
        const languages = data.data || data;
        return languages.find((l: any) => l.code.toLowerCase() === code.toLowerCase() || l.iso2 === code.toLowerCase());
    } catch (error) {
        console.error('Error fetching language:', error);
        return null;
    }
}

export const updateLanguageAssessment = async (id: string, language: string, proficiency: string, results: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments/language`, {
      language,
      proficiency,
      results
    });
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const addContactCenterAssessment = async (id: string, result: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments/contact-center`, result);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const addAssessment = async (id: string, assessment: any) => {
  try {
    const { data } = await api.post(`/profiles/${id}/assessments`, assessment);
    return data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteProfile = async (id: string) => {
  try {
    await api.delete(`/profiles/${id}`);
    return { success: true };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const analyzeCV = async (text: string) => {
  try {
    const { data } = await api.post('/ai/cv-analysis', { text });
    return data;
  } catch (error: any) {
    console.error('Error analyzing CV:', error);
    throw error.response?.data || error;
  }
};

export const generateSummaryFromProfile = async (profileData: any) => {
  try {
    const { data } = await api.post('/ai/profile-summary', { profileData });
    return data.summary;
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw error.response?.data || error;
  }
};

// Cache for skills, industries, activities, timezones, and countries to avoid multiple API calls
let skillsCache: { [key: string]: any[] } = {};
let industriesCache: any[] | null = null;
let activitiesCache: any[] | null = null;
let timezonesCache: any[] | null = null;
let countriesCache: any[] | null = null;

// Search skills in database by name (fuzzy matching)
export const searchSkillByName = async (skillName: string, type: 'technical' | 'professional' | 'soft') => {
  try {
    // Use cache if available
    if (!skillsCache[type]) {
      const { data } = await api.get(`/skills/${type}`);
      skillsCache[type] = data.data || data || [];
    }
    
    const skills = skillsCache[type];
    
    // Try exact match first (case insensitive)
    const exactMatch = skills.find((s: any) => 
      s.name?.toLowerCase() === skillName.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = skills.find((s: any) => 
      s.name?.toLowerCase().includes(skillName.toLowerCase()) ||
      skillName.toLowerCase().includes(s.name?.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Try fuzzy match with words
    const skillWords = skillName.toLowerCase().split(/\s+/);
    const fuzzyMatch = skills.find((s: any) => {
      const skillNameLower = s.name?.toLowerCase() || '';
      return skillWords.some((word: string) => skillNameLower.includes(word)) ||
             skillNameLower.split(/\s+/).some((word: string) => skillName.toLowerCase().includes(word));
    });
    
    return fuzzyMatch || null;
  } catch (error: any) {
    console.error(`Error searching ${type} skill "${skillName}":`, error);
    return null;
  }
};

// Search industry in database by name
export const searchIndustryByName = async (industryName: string) => {
  try {
    // Use cache if available
    if (!industriesCache) {
      const { data } = await api.get('/industries');
      industriesCache = data.data || data || [];
    }
    
    const industries = industriesCache || [];
    
    // Try exact match first
    const exactMatch = industries.find((ind: any) => 
      ind.name?.toLowerCase() === industryName.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = industries.find((ind: any) => 
      ind.name?.toLowerCase().includes(industryName.toLowerCase()) ||
      industryName.toLowerCase().includes(ind.name?.toLowerCase())
    );
    
    return partialMatch || null;
  } catch (error: any) {
    console.error(`Error searching industry "${industryName}":`, error);
    return null;
  }
};

// Search activity in database by name
export const searchActivityByName = async (activityName: string) => {
  try {
    // Use cache if available
    if (!activitiesCache) {
      const { data } = await api.get('/activities');
      activitiesCache = data.data || data || [];
    }
    
    const activities = activitiesCache || [];
    
    // Try exact match first
    const exactMatch = activities.find((act: any) => 
      act.name?.toLowerCase() === activityName.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = activities.find((act: any) => 
      act.name?.toLowerCase().includes(activityName.toLowerCase()) ||
      activityName.toLowerCase().includes(act.name?.toLowerCase())
    );
    
    return partialMatch || null;
  } catch (error: any) {
    console.error(`Error searching activity "${activityName}":`, error);
    return null;
  }
};

// Search timezone in database by name
export const searchTimezoneByName = async (timezoneName: string) => {
  try {
    // Use cache if available
    if (!timezonesCache) {
      const { data } = await api.get('/timezones');
      timezonesCache = data.data || data || [];
    }
    
    const timezones = timezonesCache || [];
    
    // Try exact match first (by name)
    const exactMatch = timezones.find((tz: any) => 
      tz.name?.toLowerCase() === timezoneName.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Try match by zone name (e.g., "America/New_York")
    const zoneMatch = timezones.find((tz: any) => 
      tz.zone?.toLowerCase() === timezoneName.toLowerCase()
    );
    if (zoneMatch) return zoneMatch;
    
    // Try partial match by name
    const partialMatch = timezones.find((tz: any) => 
      tz.name?.toLowerCase().includes(timezoneName.toLowerCase()) ||
      timezoneName.toLowerCase().includes(tz.name?.toLowerCase()) ||
      tz.zone?.toLowerCase().includes(timezoneName.toLowerCase()) ||
      timezoneName.toLowerCase().includes(tz.zone?.toLowerCase())
    );
    
    return partialMatch || null;
  } catch (error: any) {
    console.error(`Error searching timezone "${timezoneName}":`, error);
    return null;
  }
};

// Get first/default skill by type (used when no skills are found)
export const getDefaultSkill = async (type: 'technical' | 'professional' | 'soft') => {
  try {
    if (!skillsCache[type]) {
      const { data } = await api.get(`/skills/${type}`);
      skillsCache[type] = data.data || data || [];
    }
    const skills = skillsCache[type] || [];
    return skills.length > 0 ? skills[0] : null;
  } catch (error: any) {
    console.error(`Error getting default ${type} skill:`, error);
    return null;
  }
};

// Get first/default industry (used when no industries are found)
export const getDefaultIndustry = async () => {
  try {
    if (!industriesCache) {
      const { data } = await api.get('/industries');
      industriesCache = data.data || data || [];
    }
    const industries = industriesCache || [];
    return industries.length > 0 ? industries[0] : null;
  } catch (error: any) {
    console.error('Error getting default industry:', error);
    return null;
  }
};

// Get first/default activity (used when no activities are found)
export const getDefaultActivity = async () => {
  try {
    if (!activitiesCache) {
      const { data } = await api.get('/activities');
      activitiesCache = data.data || data || [];
    }
    const activities = activitiesCache || [];
    return activities.length > 0 ? activities[0] : null;
  } catch (error: any) {
    console.error('Error getting default activity:', error);
    return null;
  }
};

// Search country in database by name or code
export const searchCountryByName = async (countryName: string) => {
  try {
    // Use cache if available
    if (!countriesCache) {
      const { data } = await api.get('/countries');
      countriesCache = data.data || data || [];
    }
    
    const countries = countriesCache || [];
    
    // Try exact match first (by name)
    const exactMatch = countries.find((country: any) => {
      const name = country.name || country.Name || '';
      return typeof name === 'string' && name.toLowerCase() === countryName.toLowerCase();
    });
    if (exactMatch) return exactMatch;
    
    // Try match by code (e.g., "US", "FR", "MA")
    const codeMatch = countries.find((country: any) => {
      const code = country.code || country.Code || country.iso2 || country.iso3 || '';
      return typeof code === 'string' && code.toLowerCase() === countryName.toLowerCase();
    });
    if (codeMatch) return codeMatch;
    
    // Try partial match by name
    const partialMatch = countries.find((country: any) => {
      const name = country.name || country.Name || '';
      if (typeof name !== 'string') return false;
      return name.toLowerCase().includes(countryName.toLowerCase()) ||
             countryName.toLowerCase().includes(name.toLowerCase());
    });
    
    return partialMatch || null;
  } catch (error: any) {
    console.error(`Error searching country "${countryName}":`, error);
    return null;
  }
};

// Map skills from CV to database IDs with type hint
// Returns skills in the same format as languages: { skill: skillObject, level: ..., details: ... }
export const mapSkillsToDatabase = async (skills: any[], type?: 'technical' | 'professional' | 'soft') => {
  const mappedSkills = [];
  
  for (const skill of skills || []) {
    const skillName = skill.name || skill.skill || skill;
    if (!skillName || typeof skillName !== 'string') continue;
    
    let skillData = null;
    
    // If type is provided, try that type first
    if (type) {
      skillData = await searchSkillByName(skillName, type);
      if (skillData) {
        mappedSkills.push({
          skill: skillData, // Send the full object like languages
          level: skill.level || skill.confidence || 3,
          details: skill.context || skill.details || ''
        });
        console.log(`Matched ${type} skill: ${skillName} -> ${skillData.name} (${skillData._id})`);
        continue;
      }
    }
    
    // Try all types if no type provided or if type-specific search failed
    // Try technical first
    skillData = await searchSkillByName(skillName, 'technical');
    if (skillData) {
      mappedSkills.push({
        skill: skillData, // Send the full object like languages
        level: skill.level || skill.confidence || 3,
        details: skill.context || skill.details || ''
      });
      console.log(`Matched technical skill: ${skillName} -> ${skillData.name} (${skillData._id})`);
      continue;
    }
    
    // Try professional
    skillData = await searchSkillByName(skillName, 'professional');
    if (skillData) {
      mappedSkills.push({
        skill: skillData, // Send the full object like languages
        level: skill.level || skill.confidence || 3,
        details: skill.context || skill.details || ''
      });
      console.log(`Matched professional skill: ${skillName} -> ${skillData.name} (${skillData._id})`);
      continue;
    }
    
    // Try soft
    skillData = await searchSkillByName(skillName, 'soft');
    if (skillData) {
      mappedSkills.push({
        skill: skillData, // Send the full object like languages
        level: skill.level || skill.confidence || 3,
        details: skill.context || skill.details || ''
      });
      console.log(`Matched soft skill: ${skillName} -> ${skillData.name} (${skillData._id})`);
      continue;
    }
    
    // If no match found, log it but don't add it
    console.warn(`Skill not found in database: "${skillName}"`);
  }
  
  return mappedSkills;
};

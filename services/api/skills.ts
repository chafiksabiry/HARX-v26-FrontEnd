// API service for skill-related operations
import { api } from '@/lib/api';

export interface Skill {
  _id: string;
  name: string;
  description?: string;
  category: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillsByCategory {
  [category: string]: Skill[];
}

interface SkillsResponse {
  success: boolean;
  data: SkillsByCategory;
  message?: string;
}

export type SkillType = 'technical' | 'professional' | 'soft';

/**
 * Fetch skills grouped by category for a specific skill type
 */
export const fetchSkillsByType = async (skillType: SkillType): Promise<SkillsByCategory> => {
  try {
    const response = await api.get(`/skills/${skillType}/grouped`);
    
    // Check for HTTP errors
    if (response.status >= 400) {
      console.warn(`⚠️ HTTP ${response.status} error fetching ${skillType} skills`);
      return {}; // Return empty object instead of throwing
    }
    
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    
    // Handle case where response is directly the data
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      // Check if it's already grouped by category
      if (Object.keys(response.data).length > 0 && Array.isArray(Object.values(response.data)[0])) {
        return response.data;
      }
    }
    
    // If we get here, return empty object instead of throwing
    console.warn(`⚠️ Unexpected response format for ${skillType} skills:`, response.data);
    return {};
  } catch (error: any) {
    // Handle network errors or other exceptions
    console.error(`❌ Error fetching ${skillType} skills:`, error);
    
    // If it's a network error or 404, return empty object
    if (error.response?.status === 404 || error.code === 'ECONNABORTED' || !error.response) {
      console.warn(`⚠️ Endpoint not available for ${skillType} skills, returning empty data`);
      return {};
    }
    
    // For other errors, still return empty object to prevent app crash
    return {};
  }
};

/**
 * Fetch all skill types (technical, professional, soft) in parallel
 */
export const fetchAllSkills = async (): Promise<{
  technical: SkillsByCategory;
  professional: SkillsByCategory;
  soft: SkillsByCategory;
}> => {
  try {
    const [technical, professional, soft] = await Promise.all([
      fetchSkillsByType('technical'),
      fetchSkillsByType('professional'),
      fetchSkillsByType('soft')
    ]);

    return {
      technical: technical || {},
      professional: professional || {},
      soft: soft || {}
    };
  } catch (error) {
    console.error('Error fetching all skills:', error);
    // Return empty objects instead of throwing to prevent app crash
    return {
      technical: {},
      professional: {},
      soft: {}
    };
  }
};

/**
 * Get a flat list of skills from grouped skills data
 */
export const flattenSkills = (skillsByCategory: SkillsByCategory): Skill[] => {
  return Object.values(skillsByCategory).flat();
};

/**
 * Find a skill by ID from grouped skills data
 */
export const findSkillById = (skillsByCategory: SkillsByCategory, skillId: string): Skill | undefined => {
  const allSkills = flattenSkills(skillsByCategory);
  return allSkills.find(skill => skill._id === skillId);
};

/**
 * Fetch skill details by ID
 */
export const fetchSkillById = async (skillId: string, skillType: SkillType): Promise<Skill | null> => {
  try {
    const response = await api.get(`/skills/${skillType}/${skillId}`);
    
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    
    if (response.data && response.data._id) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching skill ${skillId}:`, error);
    return null;
  }
};

/**
 * Fetch multiple skills by their IDs
 */
export const fetchSkillsByIds = async (skillIds: string[], skillType: SkillType): Promise<Skill[]> => {
  try {
    const skillPromises = skillIds.map(id => fetchSkillById(id, skillType));
    const skills = await Promise.all(skillPromises);
    return skills.filter(skill => skill !== null) as Skill[];
  } catch (error) {
    console.error(`Error fetching skills for type ${skillType}:`, error);
    return [];
  }
};


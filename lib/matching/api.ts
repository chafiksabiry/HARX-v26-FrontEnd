import api from '@/lib/rep-profile/client';
import { Rep, Gig, Match, MatchingWeights, Skill, Language } from './types';

// Mock data for development if backend not fully ready
// In production, these should all be API calls

export const getReps = async (): Promise<Rep[]> => {
  try {
    // const response = await api.get('/reps');
    // return response.data;
    return []; // Mock
  } catch (error) {
    console.error('Error fetching reps:', error);
    return [];
  }
};

export const getGigs = async (): Promise<Gig[]> => {
  try {
    // const response = await api.get('/gigs');
    // return response.data;
    return []; // Mock
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return [];
  }
};

export const getGigsByCompanyId = async (companyId: string): Promise<Gig[]> => {
  try {
    // const response = await api.get(`/companies/${companyId}/gigs`);
    // return response.data;
    
    // Mock
    return [
      {
        _id: 'gig1',
        title: 'Customer Support Specialist',
        description: 'Handle inbound customer support calls.',
        companyId: companyId,
        companyName: 'Tech Solutions Inc.',
        category: 'Customer Service',
        status: 'open',
        requirements: {
          skills: [],
          languages: [],
          experience: 2
        }
      }
    ]; 
  } catch (error) {
    console.error('Error fetching company gigs:', error);
    return [];
  }
};

export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<{ matches: Match[], preferedmatches?: Match[] }> => {
  try {
    // const response = await api.post(`/matching/gigs/${gigId}`, { weights });
    // return response.data;
    
    // Mock
    return {
      matches: [],
      preferedmatches: []
    };
  } catch (error) {
    console.error('Error finding matches:', error);
    return { matches: [], preferedmatches: [] };
  }
};

export const createGigAgent = async (data: { agentId: string; gigId: string }) => {
  try {
    // const response = await api.post('/gig-agents', data);
    // return response.data;
    return { success: true };
  } catch (error) {
    console.error('Error creating gig agent:', error);
    throw error;
  }
};

export const getGigAgentsForGig = async (gigId: string) => {
  try {
    // const response = await api.get(`/gigs/${gigId}/agents`);
    // return response.data;
    return [];
  } catch (error) {
    console.error('Error fetching gig agents:', error);
    return [];
  }
};

export const getInvitedAgentsForCompany = async (companyId: string) => {
    // Mock
    return [];
};

export const getEnrollmentRequestsForCompany = async (companyId: string) => {
    // Mock
    return [];
};

export const getActiveAgentsForCompany = async (companyId: string) => {
    // Mock
    return [];
};

export const getAllSkills = async () => {
    return { professional: [], technical: [], soft: [] };
};

export const getLanguages = async () => {
    return [];
};

export const saveGigWeights = async (gigId: string, weights: MatchingWeights) => {
    // Mock
    return { success: true };
};

export const getGigWeights = async (gigId: string) => {
    // Mock
    return { matchingWeights: {
        experience: 0.5,
        skills: 0.8,
        industry: 0.4,
        languages: 0.7,
        availability: 0.6,
        timezone: 0.5,
        activities: 0.3,
        region: 0.2
    }};
};

export const resetGigWeights = async (gigId: string) => {
    // Mock
    return { success: true };
};


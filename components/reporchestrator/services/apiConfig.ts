/**
 * API configuration for REP Orchestrator
 * Handles API calls for agent data, onboarding status, and subscription plans
 */

import { api } from '@/lib/api';
import config from '../config';

/**
 * Get agent data by agent ID
 * @param agentId - The agent ID (optional, will use from config if not provided)
 * @returns Agent data including onboarding progress
 */
export const getAgentData = async (agentId?: string): Promise<any> => {
  try {
    const userData = config.getUserData();
    
    // The /api/profiles/:id endpoint expects userId, not agentId
    // So we use userId from userData
    const userId = userData.userId;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get agent data using userId (the backend endpoint searches by userId)
    try {
      const response = await api.get(`/profiles/${userId}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Invalid response format from server');
    } catch (profileError: any) {
      // If profile route fails with 404, the profile doesn't exist yet
      if (profileError.response?.status === 404) {
        console.warn('Profile not found for user:', userId);
        throw new Error('Profile not found');
      }
      // For other errors, re-throw
      throw profileError;
    }
  } catch (error: any) {
    console.error('Error fetching agent data:', error);
    throw error;
  }
};

/**
 * Refresh onboarding status for an agent
 * @param agentId - The agent ID (optional, ignored - uses userId from config)
 * @returns Updated agent data with onboarding progress
 */
export const refreshOnboardingStatus = async (agentId?: string): Promise<any> => {
  try {
    // Get the latest agent data which includes onboarding progress
    // Note: getAgentData uses userId internally, so agentId parameter is ignored
    return await getAgentData();
  } catch (error: any) {
    console.error('Error refreshing onboarding status:', error);
    throw error;
  }
};

/**
 * Get agent subscription plan
 * @param agentId - The agent ID (optional, ignored - uses userId from config)
 * @returns Plan data
 */
export const getAgentPlan = async (agentId?: string): Promise<any> => {
  try {
    const userData = config.getUserData();
    const userId = userData.userId;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await api.get(`/profiles/${userId}/plan`);
    
    // The response might be the plan directly or wrapped in a data object
    if (response.data && response.data.plan) {
      return { plan: response.data.plan };
    }
    
    return { plan: response.data || null };
  } catch (error: any) {
    console.error('Error fetching agent plan:', error);
    // If plan not found (404), return null plan
    if (error.response?.status === 404) {
      return { plan: null };
    }
    throw error;
  }
};

/**
 * Update agent subscription plan
 * @param agentId - The agent ID (optional, ignored - uses userId from config)
 * @param planId - The plan ID to activate
 * @returns Updated plan data
 */
export const updateAgentPlan = async (agentId?: string, planId?: string): Promise<any> => {
  try {
    const userData = config.getUserData();
    const userId = userData.userId;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!planId) {
      throw new Error('Plan ID is required');
    }

    // Try to update the plan via PUT /api/profiles/:id with planId in body
    // or if there's a specific route for plan update, use that
    try {
      // First, try a specific plan update route if it exists
      const response = await api.put(`/profiles/${userId}/plan`, { planId });
      if (response.data) {
        return response.data;
      }
    } catch (planRouteError: any) {
      // If specific route doesn't exist, try updating the profile with planId
      if (planRouteError.response?.status === 404 || planRouteError.response?.status === 405) {
        const profileResponse = await api.put(`/profiles/${userId}`, { 
          subscriptionPlan: planId 
        });
        if (profileResponse.data) {
          return profileResponse.data;
        }
      }
      throw planRouteError;
    }

    throw new Error('Failed to update agent plan');
  } catch (error: any) {
    console.error('Error updating agent plan:', error);
    throw error;
  }
};


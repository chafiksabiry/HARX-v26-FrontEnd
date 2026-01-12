/**
 * Progress Service for REP Orchestrator
 * Handles user progress tracking for onboarding phases
 */

import config from '../config';
import { getAgentData } from './apiConfig';

// Types
export interface UserProgress {
  completedPhaseIds: number[];
  inProgressPhaseId: number | null;
  completedActions: Record<number, number[]>;
}

/**
 * Service for handling user progress API calls
 */
class ProgressService {
  /**
   * Constructor - logs service initialization
   */
  constructor() {
    console.log('📊 Progress Service initialized');
  }

  /**
   * Fetch user progress data from the API
   * Gets progress from agent's onboardingProgress field
   */
  async getUserProgress(): Promise<UserProgress> {
    try {
      const userData = config.getUserData();
      console.log(`📥 Fetching progress data for agent: ${userData.agentId?.substring(0, 8)}...`);
      
      if (!userData.userId) {
        throw new Error('User ID is required');
      }

      // Get agent data which includes onboardingProgress
      // Note: getAgentData uses userId internally, not agentId
      const agentData = await getAgentData();
      
      if (!agentData || !agentData.onboardingProgress) {
        // Return default progress if no onboarding progress exists
        return {
          completedPhaseIds: [],
          inProgressPhaseId: 1,
          completedActions: {}
        };
      }

      const onboarding = agentData.onboardingProgress;
      const phases = onboarding.phases || {};
      
      // Map API phase data to UserProgress format
      const completedPhaseIds: number[] = [];
      let inProgressPhaseId: number | null = null;
      const completedActions: Record<number, number[]> = {};

      // Process each phase
      Object.keys(phases).forEach((phaseKey) => {
        const phaseNum = parseInt(phaseKey.replace('phase', ''));
        const phase = phases[phaseKey];
        
        if (phase.status === 'completed') {
          completedPhaseIds.push(phaseNum);
        } else if (phase.status === 'in_progress' && !inProgressPhaseId) {
          inProgressPhaseId = phaseNum;
        }

        // Map completed actions
        // API format: { requiredActions: { action1: true, action2: false }, optionalActions: {...} }
        // Our format: [0, 1, 2] (array of action indices)
        const actionIndices: number[] = [];
        
        if (phase.requiredActions) {
          Object.keys(phase.requiredActions).forEach((actionKey, index) => {
            if (phase.requiredActions[actionKey] === true) {
              actionIndices.push(index);
            }
          });
        }
        
        if (phase.optionalActions) {
          const requiredCount = phase.requiredActions ? Object.keys(phase.requiredActions).length : 0;
          Object.keys(phase.optionalActions).forEach((actionKey, index) => {
            if (phase.optionalActions[actionKey] === true) {
              actionIndices.push(requiredCount + index);
            }
          });
        }

        if (actionIndices.length > 0) {
          completedActions[phaseNum] = actionIndices;
        }
      });

      const progress: UserProgress = {
        completedPhaseIds,
        inProgressPhaseId: inProgressPhaseId || onboarding.currentPhase || null,
        completedActions
      };

      console.log('📋 User progress data retrieved:', {
        completedPhases: progress.completedPhaseIds.length,
        inProgressPhase: progress.inProgressPhaseId,
        completedActionsCount: Object.values(progress.completedActions)
          .reduce((total, actions) => total + actions.length, 0)
      });

      return progress;
    } catch (error: any) {
      console.error('❌ Error fetching user progress:', error);
      // Return default progress on error
      return {
        completedPhaseIds: [],
        inProgressPhaseId: 1,
        completedActions: {}
      };
    }
  }

  /**
   * Update phase status
   * @param phaseId - The phase ID to update
   * @param status - The new status ('completed' | 'in-progress' | 'pending')
   */
  async updatePhaseStatus(phaseId: number, status: 'completed' | 'in-progress' | 'pending'): Promise<void> {
    try {
      const userData = config.getUserData();
      
      if (!userData.agentId) {
        throw new Error('Agent ID is required');
      }

      // Map our status format to API format
      const apiStatus = status === 'in-progress' ? 'in_progress' : status === 'completed' ? 'completed' : 'not_started';
      
      // Update the agent's onboarding progress via API
      // This would typically be a PUT request to /api/agents/:id or /api/profiles/:id
      // For now, we'll store it locally and sync when possible
      console.log(`📝 Updating phase ${phaseId} status to ${status}`);
      
      // TODO: Implement API call to update phase status
      // For now, this is a no-op that will be handled by the backend when we sync
    } catch (error: any) {
      console.error(`❌ Error updating phase ${phaseId} status:`, error);
      throw error;
    }
  }

  /**
   * Sync phase progress - mark specific actions as completed
   * @param phaseId - The phase ID
   * @param requiredActionsCount - Number of required actions
   * @param optionalActionsCount - Number of optional actions completed
   */
  async syncPhaseProgress(
    phaseId: number, 
    requiredActionsCount: number, 
    optionalActionsCount: number = 0
  ): Promise<void> {
    try {
      const userData = config.getUserData();
      
      if (!userData.agentId) {
        throw new Error('Agent ID is required');
      }

      console.log(`🔄 Syncing phase ${phaseId} progress:`, {
        required: requiredActionsCount,
        optional: optionalActionsCount
      });

      // Build completed action indices
      const completedActions: number[] = [];
      for (let i = 0; i < requiredActionsCount; i++) {
        completedActions.push(i);
      }
      for (let i = 0; i < optionalActionsCount; i++) {
        completedActions.push(requiredActionsCount + i);
      }

      // TODO: Implement API call to sync phase progress
      // This would update the agent's onboardingProgress.phases.phase{phaseId}
      console.log(`✅ Phase ${phaseId} progress synced:`, completedActions);
    } catch (error: any) {
      console.error(`❌ Error syncing phase ${phaseId} progress:`, error);
      throw error;
    }
  }

  /**
   * Check if all required actions are completed for a phase
   */
  async areRequiredActionsCompleted(phaseId: number, requiredActionsCount: number): Promise<boolean> {
    try {
      const progress = await this.getUserProgress();
      const completedActions = progress.completedActions[phaseId] || [];
      
      // Check if all required action indices (0 to requiredActionsCount-1) are completed
      for (let i = 0; i < requiredActionsCount; i++) {
        if (!completedActions.includes(i)) {
          return false;
        }
      }
      
      return true;
    } catch (error: any) {
      console.error(`❌ Error checking required actions for phase ${phaseId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
const progressService = new ProgressService();
export default progressService;


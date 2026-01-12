import api from './api';

interface RequirementUpdate {
  requirementId: string;
  value: string;
}

export const requirementGroupService = {
  // Mettre à jour les requirements d'un groupe
  async updateRequirements(groupId: string, requirements: RequirementUpdate[]): Promise<void> {
    try {
      console.log(`📝 Updating requirements for group ${groupId}:`, requirements);
      await api.patch(
        `/requirement-groups/${groupId}/requirements`,
        { requirements }
      );
      console.log('✅ Requirements updated successfully');
    } catch (error) {
      console.error('❌ Error updating requirements:', error);
      throw error;
    }
  },

  // Mettre à jour une seule valeur textuelle
  async updateTextValue(groupId: string, requirementId: string, value: string): Promise<void> {
    return this.updateRequirements(groupId, [{
      requirementId,
      value
    }]);
  }
};

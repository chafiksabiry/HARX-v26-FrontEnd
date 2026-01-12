import axios from 'axios';
import api from './api';

interface ApiError {
  response?: {
    status?: number;
    data?: any;
  };
}

const isAxiosError = (error: unknown): error is ApiError => {
  return error !== null && typeof error === 'object' && 'response' in error;
};

export interface GroupStatusResponse {
  id: string;
  groupId: string;
  destinationZone: string;
  isComplete: boolean;
  totalRequirements: number;
  completedRequirements: RequirementDetail[];
  pendingRequirements: number;
}

export interface RequirementDetail {
  id: string;
  type?: 'document' | 'textual' | 'address';
  status: string;
  submittedAt?: string | Date;
  value?: DocumentValue | AddressValue | string;
  rejectionReason?: string;
}

export interface DocumentValue {
  id: string;
  filename: string;
  size: {
    unit: 'bytes';
    amount: number;
  };
  sha256: string;
  status: string;
  content_type: string;
  customerReference: string;
  createdAt: string;
  downloadUrl: string;
}

export interface AddressValue {
  id: string;
  businessName: string;
  streetAddress: string;
  locality: string;
  postalCode: string;
  countryCode: string;
  extendedAddress?: string;
  administrativeArea?: string;
}

export interface RequirementType {
  id: string;
  name: string;
  type: 'document' | 'textual' | 'address';
  description: string;
  example: string;
  acceptance_criteria: {
    max_length?: number;
    min_length?: number;
    time_limit?: string;
    locality_limit?: string;
    acceptable_values?: string[];
  };
}

export interface RequirementGroup {
  _id: string;
  telnyxId: string;
  companyId: string;
  destinationZone: string;
  status: 'pending' | 'active' | 'rejected';
  requirements: {
    requirementId: string;
    type: 'document' | 'textual' | 'address';
    status: 'pending' | 'approved' | 'rejected';
    submittedValueId?: string;
    submittedAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const requirementService = {
  // Vérifier s'il existe déjà un groupe pour un pays (nécessite companyId)
  async checkExistingGroup(companyId: string, countryCode: string): Promise<RequirementGroup | null> {
    try {
      console.log(`🔍 Checking existing group for ${companyId} in ${countryCode}`);
      const response = await api.get<RequirementGroup>(
        `/requirement-groups/companies/${companyId}/zones/${countryCode}`
      );
      
      // Check if response is valid
      if (typeof response.data === 'string' || !response.data || !response.data._id) {
        return null;
      }
      
      console.log('✅ Found existing group:', response.data);
      return response.data;
    } catch (error: unknown) {
      // If 404, no group exists
      if (isAxiosError(error) && error.response?.status === 404) {
        console.log('ℹ️ No existing group found');
        return null;
      }
      console.error('❌ Error checking existing group:', error);
      throw error;
    }
  },

  // Vérifier les requirements pour un pays
  async checkCountryRequirements(countryCode: string): Promise<{
    hasRequirements: boolean;
    requirements?: RequirementType[];
  }> {
    try {
      console.log(`🔍 Checking requirements for ${countryCode}`);
      const response = await api.get<{
        hasRequirements: boolean;
        requirements?: RequirementType[];
      }>(
        `/requirements/countries/${countryCode}/requirements`
      );
      console.log('✅ Requirements:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error checking requirements:', error);
      throw error;
    }
  },

  // Obtenir ou créer un groupe de requirements
  async getOrCreateGroup(companyId: string, destinationZone: string): Promise<{
    group: RequirementGroup;
    isNew: boolean;
  }> {
    try {
      console.log(`🔍 Getting/creating requirement group for ${companyId} in ${destinationZone}`);
      
      // First, try to get existing group
      try {
        const response = await api.get<RequirementGroup>(
          `/requirement-groups/companies/${companyId}/zones/${destinationZone}`
        );
        
        // Check if response status is 404 (axios doesn't reject 4xx due to validateStatus)
        if (response.status === 404) {
          console.log('⚠️ Group not found (404), will create new one');
          throw { isNotFound: true };
        }
        
        // Check if response is valid JSON (not HTML error page)
        if (typeof response.data === 'string' || !response.data) {
          console.warn('⚠️ Invalid response format (HTML?), will create new group');
          throw { isNotFound: true };
        }
        
        // Validate that we have a valid group object
        if (!response.data._id) {
          console.warn('⚠️ Response missing _id, will create new group');
          throw { isNotFound: true };
        }
        
        console.log('✅ Found existing group:', response.data);
        return {
          group: response.data,
          isNew: false
        };
      } catch (error: unknown) {
        // If 404 or NOT_FOUND, create new group
        const isNotFound = 
          (isAxiosError(error) && error.response?.status === 404) ||
          (error && typeof error === 'object' && 'isNotFound' in error);
          
        if (isNotFound) {
          console.log('⚠️ No existing group found, creating new one...');
          try {
            const createResponse = await api.post<RequirementGroup>(
              `/requirement-groups`,
              {
                companyId,
                destinationZone
              }
            );
            console.log('✅ Created new group:', createResponse.data);
            return {
              group: createResponse.data,
              isNew: true
            };
          } catch (createError: unknown) {
            if (isAxiosError(createError)) {
              if (createError.response?.status === 400) {
                throw new Error(createError.response.data.message || 'Invalid request parameters');
              }
              if (createError.response?.status === 409) {
                // If group already exists (rare race condition)
                console.log('⚠️ Group was created by another request, retrying get...');
                const retryResponse = await api.get<RequirementGroup>(
                  `/requirement-groups/companies/${companyId}/zones/${destinationZone}`
                );
                return {
                  group: retryResponse.data,
                  isNew: false
                };
              }
            }
            throw createError;
          }
        }
        throw error;
      }
    } catch (error: unknown) {
      console.error('❌ Error getting/creating group:', error);
      throw error;
    }
  },

  // Soumettre un document
  async submitDocument(groupId: string, field: string, file: File): Promise<RequirementGroup> {
    try {
      console.log(`📄 Submitting document for ${groupId}, field ${field}`);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<RequirementGroup>(
        `/requirements/groups/${groupId}/documents/${field}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('✅ Document submitted:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error submitting document:', error);
      throw error;
    }
  },

  // Soumettre une valeur textuelle
  async submitTextValue(groupId: string, field: string, value: string): Promise<RequirementGroup> {
    try {
      console.log(`📝 Submitting text value for ${groupId}, field ${field}`);
      const response = await api.post<RequirementGroup>(
        `/requirements/groups/${groupId}/values/${field}`,
        { value }
      );
      console.log('✅ Value submitted:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error submitting value:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un groupe
  async checkGroupStatus(groupId: string): Promise<{
    id: string;
    status: string;
    requirements: {
      field: string;
      status: string;
      rejectionReason?: string;
    }[];
    validUntil?: string;
    isComplete: boolean;
  }> {
    try {
      console.log(`🔍 Checking status for group ${groupId}`);
      const response = await api.get<{
        id: string;
        status: string;
        requirements: {
          field: string;
          status: string;
          rejectionReason?: string;
        }[];
        validUntil?: string;
        isComplete: boolean;
      }>(
        `/requirements/groups/${groupId}/status`
      );
      console.log('✅ Status:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error checking status:', error);
      throw error;
    }
  },

  // Obtenir le statut détaillé d'un groupe
  async getDetailedGroupStatus(groupId: string): Promise<GroupStatusResponse> {
    try {
      if (!groupId || groupId === 'undefined') {
        throw new Error('Invalid groupId');
      }
      
      console.log(`🔍 Getting detailed status for group ${groupId}`);
      const response = await api.get<GroupStatusResponse>(
        `/requirement-groups/${groupId}/status`
      );
      
      // Check if response is valid JSON (not HTML error page)
      if (typeof response.data === 'string' || !response.data) {
        throw new Error('Invalid response format');
      }
      
      // Ensure response has required fields
      // Handle both old format (number) and new format (array)
      const completedRequirements = Array.isArray(response.data.completedRequirements) 
        ? response.data.completedRequirements 
        : ((response.data as any).requirements || []).filter((r: any) => r.status === 'completed' || r.status === 'approved');
      
      const status: GroupStatusResponse = {
        groupId: response.data.id || groupId,
        destinationZone: response.data.destinationZone || '',
        isComplete: response.data.isComplete || false,
        totalRequirements: response.data.totalRequirements || 0,
        completedRequirements: completedRequirements,
        pendingRequirements: response.data.pendingRequirements || 0,
        id: ''
      };
      
      console.log('✅ Detailed status:', status);
      return status;
    } catch (error: unknown) {
      console.error('❌ Error getting detailed status:', error);
      throw error;
    }
  },

  // Valider les requirements d'un groupe
  async validateRequirements(groupId: string): Promise<{
    isValid: boolean;
    missingRequirements?: { field: string; type: string }[];
    groupId?: string;
    telnyxId?: string;
  }> {
    try {
      console.log(`🔍 Validating requirements for group ${groupId}`);
      const response = await api.post<{
        isValid: boolean;
        missingRequirements?: { field: string; type: string }[];
        groupId?: string;
        telnyxId?: string;
      }>(
        `/requirements/groups/${groupId}/validate`
      );
      console.log('✅ Validation result:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error validating requirements:', error);
      throw error;
    }
  }
};
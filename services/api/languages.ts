// API service for language-related operations
import { api } from '@/lib/api';

export interface Language {
  _id: string;
  code: string;
  name: string;
  nativeName: string;
  createdAt?: string;
  lastUpdated?: string;
  updatedAt?: string;
  __v?: number;
}

interface LanguagesResponse {
  success: boolean;
  data: Language[];
  message?: string;
}

export const fetchAllLanguages = async (): Promise<Language[]> => {
  try {
    const response = await api.get('/languages');
    
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
    
    // Handle case where response is directly an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to fetch languages');
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
};


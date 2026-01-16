import axios from 'axios';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    metatags?: Array<{
      'og:description'?: string;
      'og:image'?: string;
      'article:published_time'?: string;
    }>;
  };
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

export const googleApi = {
  search: async (query: string): Promise<GoogleSearchResult[]> => {
    try {
      // Use backend API (port 5000) instead of Next.js API routes
      const apiUrl = process.env.NEXT_PUBLIC_COMPANY_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await axios.get<{ success: boolean; items: GoogleSearchResult[]; error?: string; details?: string }>(
        `${apiUrl}/google/search`,
        {
          params: {
            q: query,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch search results');
      }
      
      return response.data.items || [];
    } catch (error: any) {
      console.error('Google Search API Error:', error);
      
      // Provide more helpful error messages
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          // Si les credentials ne sont pas configurés, afficher un message plus clair
          if (errorData.error.includes('credentials not configured')) {
            throw new Error('Google Search API is not configured. Please contact the administrator to set up Google Search API credentials.');
          }
          throw new Error(`${errorData.error}${errorData.details ? `: ${errorData.details}` : ''}`);
        }
      }
      
      throw new Error(error.message || 'Failed to fetch search results');
    }
  },
};



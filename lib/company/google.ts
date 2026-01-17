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
      // Use local Next.js API proxy to avoid CORS issues
      const response = await axios.get<{ success: boolean; items: GoogleSearchResult[]; error?: string; details?: string }>(
        '/api/google/search',
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



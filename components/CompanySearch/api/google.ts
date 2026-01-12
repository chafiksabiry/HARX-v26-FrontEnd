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
      // Use server-side API route instead of direct API call
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
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
      if (error.response?.data?.error) {
        throw new Error(`${error.response.data.error}${error.response.data.details ? `: ${error.response.data.details}` : ''}`);
      }
      
      throw new Error(error.message || 'Failed to fetch search results');
    }
  },
};




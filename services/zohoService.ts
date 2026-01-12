import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000/api';

// Client-side service that uses API calls instead of direct database access
export class ZohoTokenService {
  private static token: string | null = null;

  static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoho_token', token);
    }
  }

  static getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zoho_token');
      if (stored) {
        this.token = stored;
        return stored;
      }
    }
    return null;
  }

  static clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zoho_token');
    }
  }
}

// Client-side Zoho service that makes API calls to the backend
export class ZohoService {
  
  async refreshToken(userId: string): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/zoho/token/refresh`, {
        userId
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from Zoho');
      }

      const newAccessToken = response.data.access_token;
      ZohoTokenService.setToken(newAccessToken);

      return newAccessToken;
    } catch (error: any) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  async getValidToken(userId: string): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/zoho/token`, {
        params: { userId }
      });

      if (response.data.access_token) {
        ZohoTokenService.setToken(response.data.access_token);
        return response.data.access_token;
      }

      throw new Error('Zoho configuration not found');
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        throw new Error('Zoho configuration not found');
      }
      throw error;
    }
  }

  async executeWithRefresh<T>(userId: string, apiCall: (token: string) => Promise<T>): Promise<T> {
    let token = await this.getValidToken(userId);
    
    try {
      return await apiCall(token);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log("Token expired, refreshing...");
        token = await this.refreshToken(userId);
        return await apiCall(token);
      }
      throw error;
    }
  }

  async getSalesIQPortalName(token: string): Promise<string> {
    const response = await axios.get("https://salesiq.zoho.com/api/v2/portals", {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data?.data?.[0]?.screenname) {
      return response.data.data[0].screenname;
    }
    throw new Error("No SalesIQ portal found");
  }

  async getChats(userId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.get(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    return this.executeWithRefresh(userId, async (token) => {
      const portalName = await this.getSalesIQPortalName(token);
      
      const response = await axios.post(
        `https://salesiq.zoho.com/api/v2/${portalName}/conversations/${conversationId}/messages`,
        { text },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    });
  }

  async configure(userId: string, companyId: string, configData: any) {
    const response = await axios.post(`${API_BASE_URL}/zoho/configure`, {
      userId,
      companyId,
      ...configData
    });

    if (response.data.success && response.data.access_token) {
      ZohoTokenService.setToken(response.data.access_token);
      return { success: true, accessToken: response.data.access_token };
    }

    throw new Error("Failed to configure Zoho");
  }

  async checkTokenValidity(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/zoho/config/user/${userId}`);
      return response.data && response.data.accessToken;
    } catch (error) {
      return false;
    }
  }

  async disconnect(userId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/zoho/config/user/${userId}`);
    ZohoTokenService.clearToken();
  }
}

export const zohoService = new ZohoService();

// Export convenience functions for backward compatibility
export async function checkZohoTokenValidity(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      // Try to get userId from cookies or context
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const userIdCookie = cookies.find(c => c.trim().startsWith('userId='));
        if (userIdCookie) {
          userId = userIdCookie.split('=')[1];
        }
      }
    }
    if (!userId) {
      return false;
    }
    return await zohoService.checkTokenValidity(userId);
  } catch (error) {
    return false;
  }
}

export async function disconnectZoho(userId?: string): Promise<void> {
  if (!userId) {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const userIdCookie = cookies.find(c => c.trim().startsWith('userId='));
      if (userIdCookie) {
        userId = userIdCookie.split('=')[1];
      }
    }
  }
  if (!userId) {
    throw new Error('User ID is required to disconnect Zoho');
  }
  await zohoService.disconnect(userId);
}

export async function configureZoho(userId: string, companyId: string, configData: any) {
  return await zohoService.configure(userId, companyId, configData);
}

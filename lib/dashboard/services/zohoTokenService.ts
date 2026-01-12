// Frontend token management service for Zoho
export const ZohoTokenService = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoho_access_token', token);
    }
  },
  
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zoho_access_token');
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zoho_access_token');
    }
  }
};


import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://harxv26back.netlify.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 300000, // 5 minutes timeout (for large file processing)
  validateStatus: (status) => {
    // Don't reject for status codes less than 500
    return status < 500;
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept responses to handle 404 errors silently for specific endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      // Network error or timeout
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.message.includes('timeout') || error.code === 'ERR_CONNECTION_REFUSED') {
        // Only log network errors for non-critical endpoints to reduce console spam
        const url = error.config?.url || '';
        const isCriticalEndpoint = url.includes('/profiles/') || url.includes('/users/');
        
        if (!isCriticalEndpoint) {
          console.warn('⚠️ Network error (backend may be offline):', url);
        } else {
          // For critical endpoints, log once but don't spam
          console.warn('⚠️ Backend connection refused. Please ensure the backend server is running on port 5000.');
        }
        
        // For has-leads endpoint, return default value instead of throwing
        if (error.config?.url?.includes('/leads/company/') && error.config?.url?.includes('/has-leads')) {
          return Promise.resolve({
            data: { hasLeads: false, count: 0 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        }
      }
    }
    
    // Silently handle 404 for check-first-login and check-user-type endpoints
    if (
      error.response?.status === 404 &&
      (error.config?.url?.includes('/auth/check-first-login') ||
       error.config?.url?.includes('/auth/check-user-type'))
    ) {
      // Return a resolved promise with default values instead of rejecting
      return Promise.resolve({
        data: {
          success: false,
          data: error.config?.url?.includes('check-first-login')
            ? { isFirstLogin: true }
            : { userType: null }
        },
        status: 404,
        statusText: 'Not Found',
        headers: error.response?.headers || {},
        config: error.config
      });
    }
    
    // Silently handle 404 for companies/user/:userId endpoint (expected when user has no company)
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('/companies/user/')
    ) {
      // Return a resolved promise with default values instead of rejecting
      return Promise.resolve({
        data: {
          success: false,
          message: 'Company not found for this user',
          data: null
        },
        status: 404,
        statusText: 'Not Found',
        headers: error.response?.headers || {},
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (data: { fullName: string; email: string; password: string; phone: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      // Re-throw with better error handling
      if (error.response) {
        // Server responded with error status
        throw {
          ...error,
          message: error.response.data?.error || error.message || 'Invalid email or password',
          status: error.response.status
        };
      }
      // Network error or other issues
      throw {
        ...error,
        message: error.message || 'Network error. Please check your connection and try again.'
      };
    }
  },

  verifyEmail: async (data: { email: string; code: string }) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  linkedInAuth: async (code: string) => {
    const response = await api.post('/auth/linkedin', { code });
    return response.data;
  },
  sendOTP: async (userId: string, phoneNumber: string) => {
    const response = await api.post('/auth/send-otp', {userId,phoneNumber});
    return response.data;
  },
  verifyOTP: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', {userId,otp});
    return response.data;
  },
  verifyAccount: async (userId: string)=> {
    const response= await api.post('/auth/verify-account', {userId});
    return response.data;
  },
  generateVerificationCode: async (email: string) => {
    const response= await api.post('/auth/generate-verification-code',{ email });
    console.log("responseRecovery",response);
    return response.data;
  },
  changePassword: async (email: string, newPassword: string ) => {
    const response= await api.post('/auth/change-password',{ email,newPassword});
    console.log("responsechangePassword",response);
    return response.data;
  },
  linkedinSignIn: async (code: string) => {
    const response= await api.post('/auth/signin/linkedin',{ code });
    console.log("responsSignInLinkedin",response);
    return response.data;
  },
  sendVerificationEmail: async (email: string, code: string) => {
    const response= await api.post('/auth/send-verification-email',{ email,code });
    console.log("responseSendVerificationEmail",response);
    return response.data;
  },
  checkFirstLogin: async (userId: string) => {
    // Interceptor handles 404 silently, so we can just return the response
    const response = await api.post('/auth/check-first-login', { userId });
    return response.data;
  },
  checkUserType: async(userId: String) =>{
    // Interceptor handles 404 silently, so we can just return the response
    const response = await api.post('/auth/check-user-type', { userId });
    return response.data;
  },
  changeUserType: async (userId: string, newType: 'company' | 'rep') => {
    const response = await api.post('/auth/change-user-type', { userId, newType });
    return response.data;
  }
};

export const companies = {
  getByUserId: async (userId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Utiliser validateStatus pour que les 404 ne soient pas considérés comme des erreurs
      const response = await api.get(`/companies/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        validateStatus: (status) => status === 200 || status === 404 // Accepter 200 et 404 comme succès
      });
      
      // Si 404, retourner une réponse standardisée
      if (response.status === 404) {
        return {
          success: false,
          message: 'Company not found for this user',
          data: null
        };
      }
      
      return response.data;
    } catch (error: any) {
      // Fallback si validateStatus ne fonctionne pas comme prévu
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Company not found for this user',
          data: null
        };
      }
      // Pour les autres erreurs, on les propage
      throw error;
    }
  },
  getDetails: async (companyId: string) => {
    const response = await api.get(`/companies/${companyId}/details`);
    return response.data;
  },
  update: async (companyId: string, companyData: any) => {
    const response = await api.put(`/companies/${companyId}`, companyData);
    return response.data;
  },
  getOnboarding: async (companyId: string) => {
    const response = await api.get(`/companies/${companyId}/onboarding`);
    return response.data;
  },
  createOnboarding: async (companyId: string) => {
    const response = await api.post(`/companies/${companyId}/onboarding`);
    return response.data;
  },
  updateOnboardingStep: async (companyId: string, phaseId: number, stepId: number, status: string) => {
    // Use the correct route: /api/onboarding/:companyId/:phaseId/:stepId
    const response = await api.put(`/onboarding/${companyId}/${phaseId}/${stepId}`, { status });
    return response.data;
  },
  updateOnboardingStepQuery: async (companyId: string, phase: number, step: number, status: string) => {
    // Use the correct route: /api/onboarding/:companyId/:phaseId/:stepId
    const response = await api.put(`/onboarding/${companyId}/${phase}/${step}`, { status });
    return response.data;
  },
  getOnboardingStep: async (companyId: string, phase: number, step: number) => {
    const response = await api.get(`/companies/${companyId}/onboarding?phase=${phase}&step=${step}`);
    return response.data;
  },
  updateOnboardingPhase: async (companyId: string, phase: number) => {
    const response = await api.put(`/companies/${companyId}/onboarding/current-phase`, { phase });
    return response.data;
  },
  completeLastOnboarding: async (companyId: string) => {
    const response = await api.put(`/companies/${companyId}/onboarding/complete-last`);
    return response.data;
  }
};

export const leads = {
  hasLeads: async (companyId: string) => {
    try {
      const response = await api.get(`/leads/company/${companyId}/has-leads`);
      return response.data;
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        console.error('Network error when checking leads:', error);
        // Return default value instead of throwing
        return { hasLeads: false, count: 0 };
      }
      throw error;
    }
  },
  create: async (leadData: any) => {
    const response = await api.post(`/leads`, leadData);
    return response.data;
  },
  createBulk: async (leadsData: any[]) => {
    const response = await api.post(`/leads/bulk`, { leads: leadsData });
    return response.data;
  },
  getByGigId: async (gigId: string, page: number = 1, limit: number = 50) => {
    const response = await api.get(`/leads/gig/${gigId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  searchByGigId: async (gigId: string, searchQuery: string) => {
    const response = await api.get(`/leads/gig/${gigId}/search?search=${encodeURIComponent(searchQuery)}`);
    return response.data;
  },
  processFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/file-processing/process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 600000 // 10 minutes timeout for file processing (very large files can take time)
    });
    return response.data;
  }
};

export const gigs = {
  getByCompanyId: async (companyId: string) => {
    const response = await api.get(`/gigs/company/${companyId}`);
    return response.data;
  },
  hasGigs: async (companyId: string) => {
    const response = await api.get(`/gigs/company/${companyId}/has-gigs`);
    return response.data;
  },
  getById: async (gigId: string) => {
    const response = await api.get(`/gigs/${gigId}`);
    return response.data;
  },
  update: async (gigId: string, gigData: any) => {
    const response = await api.put(`/gigs/${gigId}`, gigData);
    return response.data;
  }
};

export const zoho = {
  getConfigByUserId: async (userId: string) => {
    try {
      const response = await api.get(`/zoho/config/user/${userId}`, {
        validateStatus: (status) => status === 200 || status === 404
      });
      if (response.status === 404) {
        return null; // Return null instead of throwing error
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Return null for 404 errors
      }
      throw error;
    }
  },
  refreshTokenByUserId: async (userId: string) => {
    const response = await api.post(`/zoho/config/user/${userId}/refresh-token`);
    return response.data;
  },
  syncAllLeads: async (userId: string, companyId: string, gigId: string) => {
    const response = await api.post(`/zoho/leads/sync-all`, {
      userId,
      companyId,
      gigId
    });
    return response.data;
  },
  auth: async (redirectUri?: string, state?: string) => {
    const params = new URLSearchParams();
    if (redirectUri) params.append('redirect_uri', redirectUri);
    if (state) params.append('state', state);
    const response = await api.get(`/zoho/auth?${params.toString()}`);
    return response.data;
  },
  authCallback: async (code: string, state?: string) => {
    const params = new URLSearchParams({ code });
    if (state) params.append('state', state);
    const response = await api.get(`/zoho/auth/callback?${params.toString()}`);
    return response.data;
  },
  disconnect: async () => {
    const response = await api.post(`/zoho/disconnect`);
    return response.data;
  }
};

export const files = {
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  togglePublic: async (id: string) => {
    const response = await api.patch(`/files/${id}/toggle-public`);
    return response.data;
  },
  
};

export const skills = {
  getByCategory: async (category: 'soft' | 'professional' | 'technical') => {
    const response = await api.get(`/skills?category=${category}`);
    return response.data;
  }
};


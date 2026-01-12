import api from '@/lib/rep-profile/client';

export interface Call {
  _id: string;
  agent: any;
  lead: any;
  direction: "inbound" | "outbound" | "outbound-dial";
  status: string;
  duration: number;
  recording_url?: string;
  notes?: string;
  quality_score?: number;
  createdAt: string;
  updatedAt: string;
}

export const callsApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/calls', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/calls/${id}`);
    return response.data;
  },

  create: async (data: Partial<Call>) => {
    const response = await api.post('/calls', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Call>) => {
    const response = await api.put(`/calls/${id}`, data);
    return response.data;
  },

  end: async (id: string, duration?: number) => {
    const response = await api.post(`/calls/${id}/end`, { duration });
    return response.data;
  },

  addNote: async (id: string, note: string) => {
    const response = await api.post(`/calls/${id}/notes`, { note });
    return response.data;
  },

  updateQualityScore: async (id: string, score: number) => {
    const response = await api.put(`/calls/${id}/quality-score`, { score });
    return response.data;
  },

  initiateCall: async (to: string) => {
    const response = await api.post('/calls/outgoing', { to });
    return response.data;
  },

  generateTwilioToken: async () => {
    const response = await api.get('/calls/token');
    return response.data;
  },
  
  storeCallInDBAtStartCall: async (storeCall: any) => {
    const response = await api.post('/calls/store-call-in-db-at-start-call', { storeCall });
    return response.data;
  },

  storeCallInDBAtEndCall: async (phoneNumber: string, callSid: string) => {
    const response = await api.post('/calls/store-call-in-db-at-end-call', { phoneNumber, callSid });
    return response.data;
  }
};


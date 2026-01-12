import { useState, useCallback, useEffect } from "react";
import api from '@/lib/rep-profile/client'; // Reusing the axios client

export interface Lead {
  _id: string;
  name?: string;
  company?: string;
  email?: string;
  Email_1?: string; // Original field name
  Deal_Name?: string; // Original field name
  Stage?: string;
  Phone?: string;
  Pipeline?: string;
  Activity_Tag?: string;
  Last_Activity_Time?: string;
  status?: string;
  value?: number;
  metadata?: {
    ai_analysis?: {
      score?: number;
      sentiment?: string;
    };
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const fetchLeads = useCallback(async (page = 1, limit = 50, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const { data } = await api.get(`/leads?${params.toString()}`);
      
      if (data.success) {
        setLeads(data.data);
        setPagination(data.pagination || { page, limit, total: data.data.length, totalPages: 1 });
      } else {
        throw new Error(data.error || "Failed to fetch leads");
      }
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = async (leadData: any) => {
    try {
      setLoading(true);
      const { data } = await api.post('/leads', leadData);
      if (data.success) {
        setLeads(prev => [data.data, ...prev]);
        return data.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (id: string, updateData: any) => {
    try {
      setLoading(true);
      const { data } = await api.put(`/leads/${id}`, updateData);
      if (data.success) {
        setLeads(prev => prev.map(l => l._id === id ? data.data : l));
        return data.data;
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeLead = useCallback(async (leadId: string) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/leads/${leadId}/analyze`, {});
      
      if (data.success) {
         setLeads((prevLeads) =>
          prevLeads.map((l) => (l._id === leadId ? { 
            ...l, 
            metadata: { 
                ...l.metadata, 
                ai_analysis: data.data 
            } 
          } : l))
        );
        return data.data;
      }
    } catch (err: any) {
      setError("Failed to analyze lead");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateScript = useCallback(
    async (leadId: string, type: "email" | "call") => {
      try {
        setLoading(true);
        const { data } = await api.post(`/leads/${leadId}/generate-script`, { type });
        if (data.success) {
            return data.data;
        }
      } catch (err) {
        setError("Failed to generate script");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    leads,
    loading,
    error,
    pagination,
    fetchLeads,
    createLead,
    updateLead,
    analyzeLead,
    generateScript,
  };
}


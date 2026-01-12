"use client";

import React, { useState, useEffect } from 'react';
import Operations from '@/components/repdashboard/Operations';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export default function OperationsPage() {
  const [agentId, setAgentId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentId = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        const profileResponse = await api.get(`/profiles/${userId}`);
        if (profileResponse.data?.success && profileResponse.data.data) {
          setAgentId(profileResponse.data.data._id);
        }
      } catch (error) {
        console.error('Error fetching agent ID:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentId();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading operations...</div>
      </div>
    );
  }

  return (
    <Operations 
      userId={Cookies.get('userId') || ''} 
      agentId={agentId} 
    />
  );
}


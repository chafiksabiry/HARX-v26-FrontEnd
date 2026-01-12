import { useState, useEffect } from "react";
import api from '@/lib/rep-profile/client'; // Reusing the axios client

interface DashboardStats {
  activeGigs: number;
  globalReps: number;
  successRate: number;
  revenue: number;
}

interface TopPerformer {
  name: string;
  success?: number;
  rating?: number;
  calls: number;
  revenue: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveCalls, setLiveCalls] = useState<any[]>([]);
  const [topGigs, setTopGigs] = useState<TopPerformer[]>([]);
  const [topReps, setTopReps] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, liveCallsRes, topGigsRes, topRepsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/live-calls'),
          api.get('/dashboard/top-gigs'),
          api.get('/dashboard/top-reps')
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (liveCallsRes.data.success) setLiveCalls(liveCallsRes.data.data);
        if (topGigsRes.data.success) setTopGigs(topGigsRes.data.data);
        if (topRepsRes.data.success) setTopReps(topRepsRes.data.data);

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    liveCalls,
    topGigs,
    topReps,
    loading,
    error,
  };
}


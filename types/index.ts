// Dashboard types
export interface DashboardStats {
  activeGigs: number;
  globalReps: number;
  successRate: number;
  revenue: number;
  liveCalls: Array<{
    id: string;
    name: string;
    type: string;
    duration: string;
    status: 'active' | 'waiting';
  }>;
  topGigs: Array<{
    name: string;
    success: number;
    calls: number;
    revenue: string;
  }>;
  topReps: Array<{
    name: string;
    rating: number;
    calls: number;
    revenue: string;
  }>;
}

export interface LiveCall {
  id: string;
  name: string;
  type: string;
  duration: string;
  status: 'active' | 'waiting';
}

export interface TopGig {
  name: string;
  success: number;
  calls: number;
  revenue: string;
}

export interface TopRep {
  name: string;
  rating: number;
  calls: number;
  revenue: string;
}

// Re-export Gig from matching types
export type { Gig } from './matching';

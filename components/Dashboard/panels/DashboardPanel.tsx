import React from 'react';
import { useDashboard } from '@/lib/dashboard/hooks/useDashboard';
import { 
  CreditCard, 
  CircleDollarSign, 
  ArrowUpRight, 
  Banknote, 
  Clock, 
  AlertCircle, 
  ArrowDownRight,
  Loader2
} from 'lucide-react';

const DashboardPanel = () => {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Gigs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Gigs</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeGigs || 0}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Global Reps */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reps</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.globalReps || 0}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Banknote className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.successRate || 0}%</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">${stats?.revenue || 0}</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <CircleDollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional content or widgets can be added here */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="text-gray-500 text-sm text-center py-8">
          No recent activity to show.
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;

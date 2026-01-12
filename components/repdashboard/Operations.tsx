"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Users, AlertTriangle, Settings, Database, Zap, BarChart, Shield, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { CallRecords } from './CallRecords';
import { api } from '@/lib/api';

interface OperationsProps {
  userId?: string;
  agentId?: string;
}

export default function Operations({ userId, agentId }: OperationsProps) {
  const [metrics, setMetrics] = useState([
    {
      title: 'System Health',
      value: '99.9%',
      status: 'Optimal',
      icon: Activity,
      color: 'green',
    },
    {
      title: 'Active Sessions',
      value: '0',
      status: 'No active sessions',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Pending Issues',
      value: '0',
      status: 'All Clear',
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      title: 'Response Time',
      value: '0ms',
      status: 'Normal',
      icon: Database,
      color: 'purple',
    },
  ]);

  const [callStats, setCallStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    failed: 0
  });

  useEffect(() => {
    const fetchOperationsData = async () => {
      try {
        // Fetch call statistics if agentId is available
        if (agentId) {
          try {
            const callsResponse = await api.get(`/calls/agent/${agentId}`);
            if (callsResponse.data?.success && callsResponse.data.data) {
              const calls = callsResponse.data.data;
              setCallStats({
                total: calls.length,
                completed: calls.filter((c: any) => c.status === 'completed').length,
                active: calls.filter((c: any) => c.status === 'active').length,
                failed: calls.filter((c: any) => c.status === 'failed').length,
              });
            }
          } catch (error) {
            console.error('Error fetching call stats:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching operations data:', error);
      }
    };

    fetchOperationsData();
  }, [agentId]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Panel</h1>
          <p className="text-gray-500">Monitor and manage your operations</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`p-2 bg-${metric.color}-50 rounded-lg`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <span className={`text-sm font-medium text-${metric.color}-600 bg-${metric.color}-50 px-2 py-1 rounded-full`}>
                {metric.status}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.title}</p>
          </div>
        ))}
      </div>

      {/* Call Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{callStats.total}</p>
            <p className="text-sm text-gray-500">Total Calls</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{callStats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Activity className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{callStats.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{callStats.failed}</p>
            <p className="text-sm text-gray-500">Failed</p>
          </div>
        </div>
      </div>

      {/* Call Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Call Records</h2>
        </div>
        <div className="p-6">
          <CallRecords agentId={agentId} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700">Settings</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700">Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700">Security</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Zap className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700">Performance</span>
          </button>
        </div>
      </div>
    </div>
  );
}


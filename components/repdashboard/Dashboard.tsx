"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Clock, Star, Bell, BookOpen, MessageSquare, Phone, Target, Award, ArrowRight, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

interface DashboardProps {
  profile?: any;
  userId?: string;
}

export default function Dashboard({ profile, userId }: DashboardProps) {
  const [stats, setStats] = useState([
    { icon: TrendingUp, label: 'Total Earnings', value: '$0', change: '0%', type: 'neutral' },
    { icon: Users, label: 'Active Gigs', value: '0', change: '0', type: 'neutral' },
    { icon: DollarSign, label: 'Pending Payments', value: '$0', change: 'pending', type: 'neutral' },
    { icon: Clock, label: 'Total Hours', value: '0h', change: '0%', type: 'neutral' },
  ]);
  const [activeGigs, setActiveGigs] = useState<any[]>([]);
  const [availableGigs, setAvailableGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const agentId = profile?._id || Cookies.get('agentId');
        const currentUserId = userId || Cookies.get('userId');
        
        if (!currentUserId) {
          setLoading(false);
          return;
        }

        // Fetch agent profile to get gigs
        try {
          const profileResponse = await api.get(`/profiles/${currentUserId}`);
          if (profileResponse.data?.success && profileResponse.data.data) {
            const agentProfile = profileResponse.data.data;
            
            // Get enrolled gigs from profile
            const enrolledGigs = agentProfile.gigs || [];
            setActiveGigs(enrolledGigs.filter((g: any) => g.status === 'enrolled' || g.status === 'requested'));
            
            // Calculate stats from profile
            const totalGigs = enrolledGigs.length;
            const activeGigsCount = enrolledGigs.filter((g: any) => g.status === 'enrolled').length;
            
            setStats([
              { icon: TrendingUp, label: 'Total Earnings', value: '$0', change: '0%', type: 'neutral' },
              { icon: Users, label: 'Active Gigs', value: String(activeGigsCount), change: `${totalGigs} total`, type: 'neutral' },
              { icon: DollarSign, label: 'Pending Payments', value: '$0', change: 'pending', type: 'neutral' },
              { icon: Clock, label: 'Total Hours', value: '0h', change: '0%', type: 'neutral' },
            ]);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }

        // Fetch available gigs (you may need to create this endpoint)
        try {
          const gigsResponse = await api.get('/gigs?status=active&limit=5');
          if (gigsResponse.data?.success && gigsResponse.data.data) {
            setAvailableGigs(gigsResponse.data.data.slice(0, 5));
          }
        } catch (error) {
          console.error('Error fetching available gigs:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile, userId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const userName = profile?.personalInfo?.name || 'there';

  const performanceMetrics = [
    { label: 'Customer Satisfaction', value: '4.8/5' },
    { label: 'Response Rate', value: '98%' },
    { label: 'Resolution Time', value: '15m avg' },
    { label: 'Conversion Rate', value: '65%' }
  ];

  const notifications = [
    {
      id: 1,
      type: 'project',
      message: 'New project available: Technical Support for E-commerce Platform',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received: $450 for Project #123',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'feedback',
      message: 'New client feedback received',
      time: '2 hours ago'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
            <p className="text-gray-500">Here's what's happening with your projects today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start New Project
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.type === 'positive' ? 'text-green-600' :
                stat.type === 'negative' ? 'text-red-600' :
                'text-orange-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activeGigs.length > 0 ? (
              activeGigs.map((gigEntry: any) => {
                const gig = gigEntry.gigId || gigEntry;
                return (
                  <div key={gigEntry._id || gig._id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{gig.title || 'Untitled Gig'}</h3>
                        <p className="text-sm text-gray-500">{gig.category || 'Gig'}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {gigEntry.status || 'Active'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Company: {gig.companyId?.name || 'N/A'}</span>
                        <span className="text-gray-500">Enrolled: {new Date(gigEntry.invitationDate || gigEntry.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No active gigs. Check the marketplace to find opportunities!
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-medium text-gray-900">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Start Call Session</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-gray-400" />
                  <span>View Resources</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Contact Support</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Top Performer</h2>
            </div>
            <p className="text-blue-100 mb-4">
              You're in the top 10% of representatives this month!
            </p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              View Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Available Projects */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Available Projects</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {availableGigs.length > 0 ? (
            availableGigs.map((gig: any) => (
              <div key={gig._id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{gig.title || 'Untitled Gig'}</h3>
                    <p className="text-sm text-gray-500">{gig.companyId?.name || 'Company'}</p>
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {gig.commission?.amount ? `$${gig.commission.amount}/${gig.commission.unit || 'hour'}` : 'Rate TBD'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>{gig.category || 'Gig'}</span>
                  <span>•</span>
                  <span>{gig.availability?.schedule?.length || 0} days/week</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gig.description || 'No description available'}</p>
                <button 
                  onClick={() => window.location.href = `/repdashboard/marketplace?gig=${gig._id}`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No available gigs at the moment. Check back later!
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'project' ? 'bg-blue-50' :
                  notification.type === 'payment' ? 'bg-green-50' :
                  'bg-yellow-50'
                }`}>
                  {notification.type === 'project' ? (
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  ) : notification.type === 'payment' ? (
                    <DollarSign className="w-5 h-5 text-green-600" />
                  ) : (
                    <Star className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="text-gray-900">{notification.message}</p>
                  <p className="text-sm text-gray-500">{notification.time}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Globe, Calendar, Heart, User, Mail, Clock, Search, Filter, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface MarketplaceProps {
  userId?: string;
  agentId?: string;
}

export default function Marketplace({ userId, agentId }: MarketplaceProps) {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        // Fetch available gigs
        const response = await api.get('/gigs?status=active&limit=50');
        if (response.data?.success && response.data.data) {
          setGigs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = !searchTerm || 
      gig.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || gig.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleGigClick = (gigId: string) => {
    router.push(`/repdashboard/marketplace/${gigId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gigs Marketplace</h1>
        <p className="text-gray-500">Discover and apply for available gigs</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search gigs by title, description, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Sales">Sales</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleGigClick(gig._id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{gig.title || 'Untitled Gig'}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {gig.companyId?.name || 'Company'}
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {gig.description || 'No description available'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {gig.commission?.amount ? `$${gig.commission.amount}/${gig.commission.unit || 'hour'}` : 'Rate TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {gig.destination_zone?.name?.common || 'Location TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {gig.availability?.schedule?.length || 0} days/week
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {gig.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {gig.category}
                    </span>
                  )}
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No gigs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


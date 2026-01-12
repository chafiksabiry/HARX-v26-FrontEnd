import React, { useState, useEffect } from 'react';
import api from '@/lib/rep-profile/client'; // Using the existing client
import { Loader2, Briefcase, Calendar, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Gig {
  _id: string;
  title: string;
  description: string;
  status: string;
  commission: {
    type: string;
    amount: number;
    currency: string;
  };
  schedule: {
    timeZones: string[];
  };
  destinationZones: string[];
}

const GigsPanel = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('active'); // active, applied, saved

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        // Assuming we have an endpoint to get gigs for the current user/company
        // For now, fetching all gigs (or filtered by user on backend)
        const { data } = await api.get('/gigs'); 
        setGigs(data.data || []); 
      } catch (err: any) {
        console.error("Error fetching gigs:", err);
        setError("Failed to load gigs.");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const filteredGigs = gigs.filter(gig => {
      if (filter === 'active') return gig.status !== 'completed' && gig.status !== 'cancelled'; // simplistic filter
      return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Gigs</h2>
        <Link href="/dashboard/gigs/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create New Gig
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex gap-4">
            <button 
                onClick={() => setFilter('active')}
                className={`font-medium pb-2 -mb-6.5 px-1 ${filter === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setFilter('applied')}
                className={`font-medium pb-2 -mb-6.5 px-1 ${filter === 'applied' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Applied
            </button>
             <button 
                onClick={() => setFilter('saved')}
                className={`font-medium pb-2 -mb-6.5 px-1 ${filter === 'saved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Saved
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             </div>
          ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
          ) : filteredGigs.length === 0 ? (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No gigs found</h3>
                <p className="text-gray-500 mb-6">Create a gig to get started.</p>
                <Link href="/dashboard/gigs/create" className="text-blue-600 hover:text-blue-700 font-medium">
                Create a Gig
                </Link>
            </div>
          ) : (
              <div className="grid gap-4">
                  {filteredGigs.map(gig => (
                      <div key={gig._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{gig.title}</h3>
                                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{gig.description}</p>
                                  
                                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                      {gig.commission && (
                                          <div className="flex items-center gap-1">
                                              <DollarSign className="w-4 h-4" />
                                              <span>{gig.commission.amount} {gig.commission.currency} ({gig.commission.type})</span>
                                          </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          <span>{gig.destinationZones?.join(', ') || 'Remote'}</span>
                                      </div>
                                  </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium capitalize 
                                  ${gig.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {gig.status}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigsPanel;

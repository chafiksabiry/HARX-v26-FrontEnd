"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Zap,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { 
  Rep, 
  Gig, 
  Match, 
  MatchingWeights
} from '@/lib/matching/types';
import {
  getReps,
  getGigs,
  getGigsByCompanyId,
  findMatchesForGig,
  createGigAgent,
  getGigAgentsForGig,
  getInvitedAgentsForCompany,
  getEnrollmentRequestsForCompany,
  getActiveAgentsForCompany,
  getAllSkills,
  getLanguages,
  saveGigWeights,
  getGigWeights,
  resetGigWeights,
} from '@/lib/matching/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function RepMatchingPanel() {
  const router = useRouter();
  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWeights, setShowWeights] = useState(true);
  const [weights, setWeights] = useState<MatchingWeights>({
    experience: 0,
    skills: 0,
    industry: 0,
    languages: 0,
    availability: 0,
    timezone: 0,
    activities: 0,
    region: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());
  const [companyInvitedAgents, setCompanyInvitedAgents] = useState<any[]>([]);
  const [creatingGigAgent, setCreatingGigAgent] = useState(false);
  const [gigAgentSuccess, setGigAgentSuccess] = useState<string | null>(null);
  const [gigAgentError, setGigAgentError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{
    professional: any[];
    technical: any[];
    soft: any[];
  }>({ professional: [], technical: [], soft: [] });
  const [languages, setLanguages] = useState<any[]>([]);
  const [gigHasWeights, setGigHasWeights] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalWeights, setOriginalWeights] = useState<MatchingWeights | null>(null);
  const [activeSection, setActiveSection] = useState<'matching' | 'invited' | 'enrollment' | 'active'>('matching');
  const [expandedReps, setExpandedReps] = useState<Set<string>>(new Set());
  const [expandedGigs, setExpandedGigs] = useState<Set<string>>(new Set());
  const [invitedAgentsList, setInvitedAgentsList] = useState<any[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [activeAgentsList, setActiveAgentsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [leftColumnWidth, setLeftColumnWidth] = useState<number>(40); // percentage
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Handle column resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.querySelector('.resizable-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit width between 30% and 60% to prevent overflow
    const clampedWidth = Math.max(30, Math.min(60, newWidth));
    setLeftColumnWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Fetch data from real backend
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data from backend...");
        
        const companyId = Cookies.get('companyId');
        
        // Load essential data first
        const [gigsData, invitedAgentsData, enrollmentRequestsData, activeAgentsData] = await Promise.all([
          companyId ? getGigsByCompanyId(companyId) : getGigs(),
          companyId ? getInvitedAgentsForCompany(companyId) : [],
          companyId ? getEnrollmentRequestsForCompany(companyId) : [],
          companyId ? getActiveAgentsForCompany(companyId) : []
        ]);
        
        // Set essential data
        setGigs(gigsData);
        setCompanyInvitedAgents(invitedAgentsData);
        setEnrollmentRequests(enrollmentRequestsData);
        setActiveAgentsList(activeAgentsData);
        
        // Then load secondary data
        const [representativesData, skillsData, languagesData] = await Promise.all([
          getReps(),
          getAllSkills(),
          getLanguages()
        ]);
        
        // Set secondary data
        setReps(representativesData);
        setSkills(skillsData);
        setLanguages(languagesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update agent lists when data changes
  useEffect(() => {
    // Skip if no data yet
    if (!companyInvitedAgents || !enrollmentRequests || !activeAgentsList) return;
    
    // Directly set the lists without filtering again
    setInvitedAgentsList(companyInvitedAgents.filter(agent => !agent.isActive && !agent.hasCompletedOnboarding));
    setEnrollmentRequests(enrollmentRequests);
    // Active agents come directly from the API endpoint
  }, [companyInvitedAgents, enrollmentRequests, activeAgentsList]);

  const handleGigSelect = async (gig: Gig) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setLoading(true);
    setError(null);
    setMatches([]);
    setSearchTerm(''); // Clear search when selecting a new gig
    
    // Reset weights state
    setGigHasWeights(false);
    setHasUnsavedChanges(false);
    setOriginalWeights(null);
    
    let currentWeights = weights;
    
    try {
      // Try to load saved weights for this gig
      try {
        const savedWeights = await getGigWeights(gig._id || '');
        setWeights(savedWeights.matchingWeights);
        setOriginalWeights(savedWeights.matchingWeights);
        setGigHasWeights(true);
        setHasUnsavedChanges(false);
        currentWeights = savedWeights.matchingWeights;
      } catch (error) {
        setGigHasWeights(false);
      }
      
      // Fetch invited reps for this gig
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      
      // Find matches for the selected gig using current or loaded weights
      const matchesData = await findMatchesForGig(gig._id || '', currentWeights);
      
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
      
    } catch (error) {
      console.error("Error getting matches:", error);
      setError("Failed to get matches. Please try again.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    const newWeights = {
      ...weights,
      [key]: value,
    };
    
    setWeights(newWeights);
    
    // Check if weights have been modified from original
    if (originalWeights && gigHasWeights) {
      const hasChanges = Object.keys(newWeights).some(
        k => Math.abs(newWeights[k as keyof MatchingWeights] - originalWeights[k as keyof MatchingWeights]) > 0.001
      );
      setHasUnsavedChanges(hasChanges);
    }
    
    // Auto-search when weights change if a gig is selected (without reloading saved weights)
    if (selectedGig) {
      searchWithCurrentWeights(newWeights);
    }
  };

  const searchWithCurrentWeights = async (currentWeights = weights) => {
    if (!selectedGig) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const matchesData = await findMatchesForGig(selectedGig._id || '', currentWeights);
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
      
      // Fetch invited reps for this gig
      const gigAgents = await getGigAgentsForGig(selectedGig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      
    } catch (error) {
      console.error("Error searching with current weights:", error);
      setError("Failed to get matches. Please try again.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const resetWeights = () => {
    const defaultWeights: MatchingWeights = {
      experience: 0,
      skills: 0,
      industry: 0,
      languages: 0,
      availability: 0,
      timezone: 0,
      activities: 0,
      region: 0,
    };
    setWeights(defaultWeights);
    
    // Check if we have unsaved changes after reset
    if (originalWeights && gigHasWeights) {
      const hasChanges = Object.keys(defaultWeights).some(
        k => Math.abs(defaultWeights[k as keyof MatchingWeights] - originalWeights[k as keyof MatchingWeights]) > 0.001
      );
      setHasUnsavedChanges(hasChanges);
    }
    
    // Auto-search when weights are reset if a gig is selected (without reloading saved weights)
    if (selectedGig) {
      searchWithCurrentWeights(defaultWeights);
    }
  };

  const saveWeightsForGig = async () => {
    if (!selectedGig) {
      setError('No gig selected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Save weights to backend
      await saveGigWeights(selectedGig._id || '', weights);
      setGigHasWeights(true);
      setOriginalWeights(weights);
      setHasUnsavedChanges(false);
      
      // Trigger new search with saved weights using the new function
      await searchWithCurrentWeights();
      
    } catch (error) {
      console.error('❌ Error saving weights or searching:', error);
      setError('Failed to save weights or search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOnboarding = async () => {
    router.push('/dashboard'); // Or appropriate back route
  };
  
    // Toggle gig details expansion
  const toggleGigDetails = (gigId: string) => {
    setExpandedGigs((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(gigId)) {
        newSet.delete(gigId);
      } else {
        newSet.add(gigId);
      }
      return newSet;
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full max-w-full overflow-x-hidden">
      {/* Header with Navigation Tabs */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        {/* Top Header */}
        <div className="container mx-auto px-2 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Back to Onboarding Button */}
              <button
                onClick={handleBackToOnboarding}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="p-2 bg-white/20 rounded-lg">
                <Users size={24} className="text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Reps Management System</h1>
                <p className="text-blue-200 text-sm">Manage reps through their complete lifecycle</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6 px-4 py-2 bg-white/10 rounded-lg text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{reps.length}</div>
                <div className="text-blue-200 text-xs">Total Reps</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{invitedAgentsList.length}</div>
                <div className="text-blue-200 text-xs">Invited</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{enrollmentRequests.length}</div>
                <div className="text-blue-200 text-xs">Requests</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{activeAgentsList.length}</div>
                <div className="text-blue-200 text-xs">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-white/20">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-0">
              {[
                { id: 'matching', label: 'Smart Matching System', icon: '🎯', description: 'Find & match perfect reps' },
                { id: 'invited', label: 'Invited Reps', icon: '📧', description: 'Pending invitations' },
                { id: 'enrollment', label: 'Enrollment Requests', icon: '📋', description: 'Rep applications' },
                { id: 'active', label: 'Active Reps', icon: '✅', description: 'Working reps' }
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex-1 px-4 py-4 text-left transition-all duration-200 border-b-2 ${
                    activeSection === section.id
                      ? 'border-blue-300 bg-white/10'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className={`font-medium ${activeSection === section.id ? 'text-blue-300' : 'text-white'}`}>
                        {section.label}
                      </div>
                      <div className="text-blue-200 text-xs">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 w-full max-w-full overflow-hidden">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <p className="flex items-center">
              {error}
            </p>
          </div>
        )}

        {/* Loading Indicators */}
        {initialLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </div>
        )}

        {/* Section Content */}
        {!initialLoading && (
          <>
            {/* 1. SMART MATCHING SYSTEM */}
            {activeSection === 'matching' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎯 Smart Matching System</h2>
                    <p className="text-gray-600">Find and match the perfect reps for your gigs</p>
                  </div>
                  <button
                    onClick={() => setShowWeights(!showWeights)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium ${
                      showWeights 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Settings size={16} className={showWeights ? 'rotate-180' : ''} />
                    <span>{showWeights ? 'Close Weights' : 'Adjust Weights'}</span>
                  </button>
                </div>

                {/* Weights Configuration Panel */}
                {showWeights && (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
                    {/* ... Weights UI ... */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                         {Object.entries(weights).map(([key, value]) => (
                            <div key={key} className="bg-white p-3 rounded-lg shadow-sm border">
                                <label className="text-sm font-bold uppercase block mb-2 flex justify-between">
                                    {key}
                                    <span className="text-blue-600">{Math.round(value * 100)}%</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.05"
                                    value={value}
                                    onChange={(e) => handleWeightChange(key, parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                         ))}
                    </div>
                    
                     {selectedGig && (
                        <div className="flex justify-center">
                            <button 
                                onClick={saveWeightsForGig}
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg text-white font-semibold ${hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Weights Saved'}
                            </button>
                        </div>
                     )}
                  </div>
                )}
                
                {/* Two Column Layout */}
                <div className="resizable-container flex gap-4 w-full h-[600px]">
                    {/* Left Column: Gigs */}
                    <div style={{ width: `${leftColumnWidth}%` }} className="bg-white rounded-xl shadow-lg p-4 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Briefcase size={20} className="mr-2 text-blue-600" />
                            Available Gigs
                        </h3>
                        <div className="overflow-y-auto flex-1 space-y-2">
                             {gigs.map(gig => (
                                 <div 
                                    key={gig._id}
                                    onClick={() => handleGigSelect(gig)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedGig?._id === gig._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                 >
                                     <h4 className={`font-bold text-sm ${selectedGig?._id === gig._id ? 'text-blue-900' : 'text-gray-800'}`}>{gig.title}</h4>
                                     <p className="text-xs text-gray-600">{gig.companyName}</p>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); toggleGigDetails(gig._id || ''); }}
                                        className="text-xs text-blue-500 hover:text-blue-700 mt-2"
                                     >
                                         {expandedGigs.has(gig._id || '') ? 'Hide Details' : 'View Details'}
                                     </button>
                                     
                                     {expandedGigs.has(gig._id || '') && (
                                         <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                                             <p>{gig.description}</p>
                                             {/* Add more gig details here */}
                                         </div>
                                     )}
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* Resizer Handle */}
                    <div className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex items-center justify-center rounded" onMouseDown={handleMouseDown}>
                        <div className="h-8 w-1 bg-gray-400 rounded-full"></div>
                    </div>

                    {/* Right Column: Matches */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg p-4 overflow-hidden flex flex-col">
                         <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Users size={20} className="mr-2 text-green-600" />
                            Matched Reps {selectedGig && `for ${selectedGig.title}`}
                        </h3>
                        
                        {selectedGig ? (
                            <div className="overflow-y-auto flex-1 space-y-4">
                                {matches.length > 0 ? (
                                    matches.map((match, index) => (
                                        <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg">{match.agentInfo?.personalInfo.name || 'Unknown Rep'}</h4>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                                            {Math.round(match.totalMatchingScore)}% Match
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                                    Invite
                                                </button>
                                            </div>
                                            {/* Match details visualization */}
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                 <div>Skills: {Math.round((match.skillsMatch?.score || 0) * 100)}%</div>
                                                 <div>Experience: {Math.round((match.experienceMatch?.score || 0) * 100)}%</div>
                                                 {/* ... other scores */}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-10">No matches found. Try adjusting weights.</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Briefcase size={48} className="mb-4 text-gray-300" />
                                <p>Select a gig to see matched reps</p>
                            </div>
                        )}
                    </div>
                </div>

              </div>
            )}
            
            {/* Other sections placeholders */}
            {activeSection !== 'matching' && (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-400 mb-4">
                        {activeSection === 'invited' ? 'Invited Reps' : 
                         activeSection === 'enrollment' ? 'Enrollment Requests' : 'Active Reps'}
                    </h2>
                    <p className="text-gray-500">Feature coming soon in this migration.</p>
                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


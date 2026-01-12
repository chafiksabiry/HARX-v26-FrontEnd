"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Tags,
  Building2,
  Briefcase,
  Clock,
  Globe,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API

interface GigDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  destination_zone?: {
    name?: {
      common?: string;
    };
    cca2?: string;
  } | string;
  seniority?: {
    level: string;
    yearsExperience: string;
  };
  skills?: {
    professional?: Array<{
      skill?: {
        name?: string;
        description?: string;
        category?: string;
      } | string;
      level?: number;
    }>;
    technical?: Array<{
      skill?: {
        name?: string;
        description?: string;
        category?: string;
      } | string;
      level?: number;
    }>;
    soft?: Array<{
      skill?: {
        name?: string;
        description?: string;
        category?: string;
      } | string;
      level?: number;
    }>;
    languages?: Array<{
      language?: {
        name?: string;
        code?: string;
      } | string;
      proficiency?: string;
    }>;
  };
  availability?: {
    schedule?: Array<{
      day?: string;
      hours?: {
        start?: string;
        end?: string;
      };
    }>;
    time_zone?: {
      name?: string;
      gmtDisplay?: string;
    } | string;
    flexibility?: string[];
  };
  commission?: {
    base?: string;
    baseAmount?: string;
    bonus?: string;
    bonusAmount?: string;
    currency?: {
      name?: string;
      code?: string;
      symbol?: string;
    } | string;
    minimumVolume?: {
      amount?: string;
      period?: string;
      unit?: string;
    };
  };
  companyId?: {
    name?: string;
  } | string;
  userId?: {
    name?: string;
    email?: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GigDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const gigId = params?.id as string;
  const [gig, setGig] = useState<GigDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigDetails = async () => {
      if (!gigId) {
        setError('No gig ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/gigs/${gigId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gig details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Gig details:', data);
        
        if (data.success && data.data) {
          setGig(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching gig details:', err);
        setError(err.message || 'Failed to load gig details');
      } finally {
        setLoading(false);
      }
    };

    fetchGigDetails();
  }, [gigId]);

  const handleBack = () => {
    router.push('/dashboard?panel=gigs');
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/gigs/${gigId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete gig');
        }

        Swal.fire(
          'Deleted!',
          'The gig has been deleted.',
          'success'
        ).then(() => {
          router.push('/dashboard?panel=gigs');
        });
      } catch (err: any) {
        console.error("Error deleting gig:", err);
        Swal.fire(
          'Error!',
          'Failed to delete the gig.',
          'error'
        );
      }
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/gigs/${gigId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gig</h2>
          <p className="text-gray-600 mb-4">{error || 'Gig not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Gigs
          </button>
        </div>
      </div>
    );
  }

  const getDestinationName = () => {
    if (!gig.destination_zone) return 'Not specified';
    if (typeof gig.destination_zone === 'string') return gig.destination_zone;
    return gig.destination_zone.name?.common || 'Not specified';
  };

  const getCurrencyInfo = () => {
    if (!gig.commission?.currency) return 'Not specified';
    if (typeof gig.commission.currency === 'string') return gig.commission.currency;
    return `${gig.commission.currency.symbol || ''} ${gig.commission.currency.code || ''} (${gig.commission.currency.name || ''})`;
  };

  const getTimezoneInfo = () => {
    if (!gig.availability?.time_zone) return 'Not specified';
    if (typeof gig.availability.time_zone === 'string') return gig.availability.time_zone;
    return gig.availability.time_zone.gmtDisplay || gig.availability.time_zone.name || 'Not specified';
  };

  const getCompanyName = () => {
    if (!gig.companyId) return 'Not specified';
    if (typeof gig.companyId === 'string') return gig.companyId;
    return gig.companyId.name || 'Not specified';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Gigs</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title || 'Untitled Gig'}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            {gig.category && (
              <div className="flex items-center gap-2">
                <Tags size={18} />
                <span>{gig.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Building2 size={18} />
              <span>{getCompanyName()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{getDestinationName()}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{gig.description || 'No description provided.'}</p>
            </div>

            {/* Skills */}
            {gig.skills && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="space-y-4">
                  {gig.skills.professional && gig.skills.professional.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Professional Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills.professional.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gig.skills.technical && gig.skills.technical.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills.technical.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gig.skills.soft && gig.skills.soft.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills.soft.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gig.skills.languages && gig.skills.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.skills.languages.map((lang, idx) => (
                          <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {typeof lang.language === 'string' ? lang.language : lang.language?.name || 'Unknown'}
                            {lang.proficiency && ` (${lang.proficiency})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            {gig.availability && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                <div className="space-y-3">
                  {gig.availability.time_zone && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-gray-600" />
                      <span className="text-gray-700">Timezone: {getTimezoneInfo()}</span>
                    </div>
                  )}
                  {gig.availability.flexibility && gig.availability.flexibility.length > 0 && (
                    <div>
                      <span className="text-gray-700 font-medium">Flexibility: </span>
                      <span className="text-gray-600">{gig.availability.flexibility.join(', ')}</span>
                    </div>
                  )}
                  {gig.availability.schedule && gig.availability.schedule.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Schedule</h3>
                      <div className="space-y-2">
                        {gig.availability.schedule.map((schedule, idx) => (
                          <div key={idx} className="text-gray-700">
                            {schedule.day}: {schedule.hours?.start} - {schedule.hours?.end}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Seniority */}
            {gig.seniority && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seniority</h2>
                <div className="space-y-2">
                  {gig.seniority.level && (
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-600" />
                      <span className="text-gray-700">Level: {gig.seniority.level}</span>
                    </div>
                  )}
                  {gig.seniority.yearsExperience && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-gray-600" />
                      <span className="text-gray-700">Experience: {gig.seniority.yearsExperience} years</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commission */}
            {gig.commission && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Commission</h2>
                <div className="space-y-2">
                  {gig.commission.base && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-gray-600" />
                      <span className="text-gray-700">Base: {gig.commission.base}</span>
                    </div>
                  )}
                  {gig.commission.baseAmount && (
                    <div className="text-gray-700">Amount: {gig.commission.baseAmount}</div>
                  )}
                  {gig.commission.bonus && (
                    <div className="text-gray-700">Bonus: {gig.commission.bonus}</div>
                  )}
                  {gig.commission.bonusAmount && (
                    <div className="text-gray-700">Bonus Amount: {gig.commission.bonusAmount}</div>
                  )}
                  {gig.commission.currency && (
                    <div className="text-gray-700">Currency: {getCurrencyInfo()}</div>
                  )}
                  {gig.commission.minimumVolume && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Minimum Volume:</div>
                      <div className="text-gray-700">
                        {gig.commission.minimumVolume.amount} {gig.commission.minimumVolume.unit} per {gig.commission.minimumVolume.period}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Information</h2>
              <div className="space-y-2 text-sm text-gray-600">
                {gig.createdAt && (
                  <div>Created: {new Date(gig.createdAt).toLocaleDateString()}</div>
                )}
                {gig.updatedAt && (
                  <div>Updated: {new Date(gig.updatedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


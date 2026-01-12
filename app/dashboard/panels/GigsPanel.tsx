"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MapPin,
  Building2,
  Tags,
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Globe2,
  Brain,
  Target,
} from "lucide-react";
import Cookies from 'js-cookie';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API ;

interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  userId: string;
  companyId: string;
  destination_zone: string | any;
  industries?: string[] | any[];
  activities?: string[] | any[];
  seniority: {
    level: string;
    yearsExperience: string;
  };
  schedule: {
    days?: string[];
    hours?: string;
    timeZones?: string[];
    flexibility?: string[];
    schedules?: Array<{
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }>;
  };
  availability?: {
    time_zone?: string | any;
    flexibility?: string[];
    schedule?: Array<{
      day: string;
      hours: {
        start: string;
        end: string;
      };
    }>;
  };
  commission: {
    minimumVolume?: {
      amount: string;
      period: string;
      unit: string;
    };
    transactionCommission?: {
      type: string;
      amount: string;
    };
    base: string;
    baseAmount: string;
    bonus: string;
    bonusAmount: string;
    currency: string | any;
  };
  skills: {
    professional: string[];
    languages: string[];
    technical: string[];
    soft: string[];
  };
  duration?: {
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}


function GigsPanel() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState<string>("");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'show'>('show');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'edit'>('list');
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);
  const [gigDetails, setGigDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editedGig, setEditedGig] = useState<Gig | null>(null);
  
  // Data for dropdowns
  const [countries, setCountries] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-600";
      case "assigned":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-gray-100 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  const companyId = Cookies.get('userId');

  // const fetchCompanyDetails = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/companies/${companyId}`
  //     );
  //     setCompanyName(response.data.data.name);
  //   } catch (err) {
  //     console.error("Error loading company details:", err);
  //   }
  // };

  const fetchGigsByUserId = async () => {
    try {

      const userId: string = Cookies.get('userId') || '680a27ffefa3d29d628d0016';
    console.log('Stored userId:', userId);
      if (!userId) {
        console.error("No user ID found");
        setLoading(false);
        return;
      }

      console.log("Fetching gigs for user:", userId);
      const response = await fetch(`${API_BASE_URL}/gigs/user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid data format");
      }

      const validGigs = data.data;
      setGigs(validGigs);
    } catch (error) {
      console.error("Detailed error:", error);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchCompanyDetails();
  // }, [companyId]);

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [countriesRes, timezonesRes, currenciesRes, industriesRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/countries`).catch(() => null),
        fetch(`${API_BASE_URL}/timezones`).catch(() => null),
        fetch(`${API_BASE_URL}/currencies`).catch(() => null),
        fetch(`${API_BASE_URL}/industries`).catch(() => null),
        fetch(`${API_BASE_URL}/activities`).catch(() => null),
      ]);

      if (countriesRes?.ok) {
        const data = await countriesRes.json();
        setCountries(data.data || data || []);
      }
      if (timezonesRes?.ok) {
        const data = await timezonesRes.json();
        setTimezones(data.data || data || []);
      }
      if (currenciesRes?.ok) {
        const data = await currenciesRes.json();
        setCurrencies(data.data || data || []);
      }
      if (industriesRes?.ok) {
        const data = await industriesRes.json();
        setIndustries(data.data || data || []);
      }
      if (activitiesRes?.ok) {
        const data = await activitiesRes.json();
        setActivities(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
      fetchGigsByUserId();
      fetchDropdownData();
  }, [companyId]);

  // Add populated data to dropdown lists if they're not already there
  useEffect(() => {
    if (!gigDetails) return;

    // Add populated timezone
    if (gigDetails.availability?.time_zone && typeof gigDetails.availability.time_zone === 'object') {
      const tzId = gigDetails.availability.time_zone._id;
      const exists = timezones.find((tz: any) => (tz._id || tz.id) === tzId);
      if (!exists && tzId) {
        setTimezones(prev => {
          const alreadyExists = prev.find((tz: any) => (tz._id || tz.id) === tzId);
          if (!alreadyExists) {
            return [...prev, gigDetails.availability.time_zone];
          }
          return prev;
        });
      }
    }

    // Add populated industries
    if (Array.isArray(gigDetails.industries)) {
      gigDetails.industries.forEach((ind: any) => {
        if (typeof ind === 'object' && ind._id) {
          const exists = industries.find((i: any) => i._id === ind._id);
          if (!exists) {
            setIndustries(prev => {
              const alreadyExists = prev.find((i: any) => i._id === ind._id);
              if (!alreadyExists) {
                return [...prev, ind];
              }
              return prev;
            });
          }
        }
      });
    }

    // Add populated activities
    if (Array.isArray(gigDetails.activities)) {
      gigDetails.activities.forEach((act: any) => {
        if (typeof act === 'object' && act._id) {
          const exists = activities.find((a: any) => a._id === act._id);
          if (!exists) {
            setActivities(prev => {
              const alreadyExists = prev.find((a: any) => a._id === act._id);
              if (!alreadyExists) {
                return [...prev, act];
              }
              return prev;
            });
          }
        }
      });
    }

    // Add populated destination_zone (country)
    if (gigDetails.destination_zone && typeof gigDetails.destination_zone === 'object') {
      const countryId = gigDetails.destination_zone._id || gigDetails.destination_zone.cca2;
      const exists = countries.find((c: any) => (c._id || c.cca2) === countryId);
      if (!exists && countryId) {
        setCountries(prev => {
          const alreadyExists = prev.find((c: any) => (c._id || c.cca2) === countryId);
          if (!alreadyExists) {
            return [...prev, gigDetails.destination_zone];
          }
          return prev;
        });
      }
    }

    // Add populated currency
    if (gigDetails.commission?.currency && typeof gigDetails.commission.currency === 'object') {
      const currId = gigDetails.commission.currency._id;
      const exists = currencies.find((c: any) => c._id === currId);
      if (!exists && currId) {
        setCurrencies(prev => {
          const alreadyExists = prev.find((c: any) => c._id === currId);
          if (!alreadyExists) {
            return [...prev, gigDetails.commission.currency];
          }
          return prev;
        });
      }
    }
  }, [gigDetails]);

  // Country names mapping (no longer using i18n-iso-countries registerLocale)
  // Countries are now loaded from the API

  const countryNames: { [key: string]: string } = {
    "MA": "Morocco",
    "FR": "France",
    "US": "United States",
    "GB": "United Kingdom",
    "DE": "Germany",
    "ES": "Spain",
    "IT": "Italy",
    "BE": "Belgium",
    "CA": "Canada",
    "CH": "Switzerland",
    "DZ": "Algeria",
    "TN": "Tunisia",
    "SN": "Senegal",
    "CI": "Ivory Coast",
    "CM": "Cameroon",
    "ML": "Mali",
    "BF": "Burkina Faso",
    "BJ": "Benin",
    "TG": "Togo",
    "NE": "Niger",
    "CD": "Democratic Republic of the Congo",
    "CG": "Congo",
    "GA": "Gabon",
    "GN": "Guinea",
    "MR": "Mauritania",
    "MG": "Madagascar",
    "MU": "Mauritius",
    "RE": "Réunion",
    "YT": "Mayotte",
    "NC": "New Caledonia",
    "PF": "French Polynesia",
    "GF": "French Guiana",
    "GP": "Guadeloupe",
    "MQ": "Martinique",
    "BL": "Saint Barthélemy",
    "MF": "Saint Martin",
    "PM": "Saint Pierre and Miquelon",
    "WF": "Wallis and Futuna"
  };

  const getCountryName = (destinationZone: any) => {
    if (typeof destinationZone === 'string') {
      return countryNames[destinationZone] || destinationZone;
    }
    if (destinationZone?.name?.common) {
      return destinationZone.name.common;
    }
    if (destinationZone?.cca2) {
      return countryNames[destinationZone.cca2] || destinationZone.cca2;
    }
    return 'Unknown location';
  };

  const handleEdit = async (gig: Gig) => {
    // Load gig details and show edit form in the same panel
    setSelectedGigId(gig._id);
    setViewMode('edit');
    setLoadingDetails(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/gigs/${gig._id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch gig details: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        const gigData = data.data;
        console.log('Gig data received:', gigData);
        console.log('Timezone data:', gigData.availability?.time_zone);
        
        // Normalize data for editing - convert populated objects to IDs where needed
        // But keep the original data in gigDetails for display purposes
        const normalizedGig: any = {
          ...gigData,
          destination_zone: typeof gigData.destination_zone === 'object' && gigData.destination_zone?._id 
            ? gigData.destination_zone._id 
            : (typeof gigData.destination_zone === 'object' && gigData.destination_zone?.cca2
              ? gigData.destination_zone.cca2
              : gigData.destination_zone || ''),
          industries: Array.isArray(gigData.industries) 
            ? gigData.industries.map((ind: any) => typeof ind === 'object' && ind._id ? ind._id : ind)
            : [],
          activities: Array.isArray(gigData.activities)
            ? gigData.activities.map((act: any) => typeof act === 'object' && act._id ? act._id : act)
            : [],
          commission: {
            ...gigData.commission,
            currency: typeof gigData.commission?.currency === 'object' && gigData.commission?.currency?._id
              ? gigData.commission.currency._id
              : gigData.commission?.currency || '',
          },
          availability: {
            ...gigData.availability,
            // Keep the timezone object for display, but also store the ID for the form
            time_zone: typeof gigData.availability?.time_zone === 'object' && gigData.availability?.time_zone?._id
              ? gigData.availability.time_zone._id
              : gigData.availability?.time_zone || '',
          },
        };
        setGigDetails(gigData);
        setEditedGig(normalizedGig as Gig);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching gig details:', err);
      Swal.fire('Error!', err.message || 'Failed to load gig details', 'error');
      setViewMode('list');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedGig) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentObj = editedGig[parent as keyof Gig] as Record<string, any>;
      setEditedGig({
        ...editedGig,
        [parent]: {
          ...parentObj,
          [child]: value
        }
      });
    } else {
      setEditedGig({
        ...editedGig,
        [field]: value
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedGig) return;

    try {
      console.log('Sending update request for gig:', editedGig);
      
      const response = await fetch(`${API_BASE_URL}/gigs/${editedGig._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(editedGig),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Failed to update gig: ${response.status} ${response.statusText}`);
      }

      // Update the gigs list with the edited gig
      setGigs(gigs.map(gig => 
        gig._id === editedGig._id ? editedGig : gig
      ));

      // Update gig details state
      setGigDetails(editedGig);
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Gig updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Switch back to details view after successful save
      setViewMode('details');
    } catch (error) {
      console.error('Error updating gig:', error);
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update gig',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDelete = async (gigId: string) => {
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

        setGigs(gigs.filter(gig => gig._id !== gigId));
        
        Swal.fire(
          'Deleted!',
          'The gig has been deleted.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting gig:", error);
        Swal.fire(
          'Error!',
          'Failed to delete the gig.',
          'error'
        );
      }
    }
  };

  const handleShow = async (gig: Gig) => {
    // Fetch gig details and show in the same panel
    setSelectedGigId(gig._id);
    setViewMode('details');
    setLoadingDetails(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/gigs/${gig._id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch gig details: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setGigDetails(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching gig details:', err);
      Swal.fire('Error!', err.message || 'Failed to load gig details', 'error');
      setViewMode('list');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedGigId(null);
    setGigDetails(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGig(null);
  };

  const filteredGigs = gigs.filter(gig => {
    if (activeFilter === "available") {
      if (!gig.duration?.endDate) return true;
      const endDate = new Date(gig.duration.endDate);
      const now = new Date();
      return endDate > now;
    }
    return true;
  });

  // Helper functions for gig details
  const getDestinationName = () => {
    if (!gigDetails?.destination_zone) return 'Not specified';
    if (typeof gigDetails.destination_zone === 'string') return gigDetails.destination_zone;
    return gigDetails.destination_zone.name?.common || 'Not specified';
  };

  const getCurrencyInfo = () => {
    if (!gigDetails?.commission?.currency) return 'Not specified';
    if (typeof gigDetails.commission.currency === 'string') return gigDetails.commission.currency;
    return `${gigDetails.commission.currency.symbol || ''} ${gigDetails.commission.currency.code || ''} (${gigDetails.commission.currency.name || ''})`;
  };

  const getTimezoneInfo = () => {
    if (!gigDetails?.availability?.time_zone) return 'Not specified';
    if (typeof gigDetails.availability.time_zone === 'string') return gigDetails.availability.time_zone;
    return gigDetails.availability.time_zone.gmtDisplay || gigDetails.availability.time_zone.name || 'Not specified';
  };

  const getCompanyName = () => {
    if (!gigDetails?.companyId) return 'Not specified';
    if (typeof gigDetails.companyId === 'string') return gigDetails.companyId;
    return gigDetails.companyId.name || 'Not specified';
  };

  const handleDeleteGig = async () => {
    if (!selectedGigId) return;
    
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
        const response = await fetch(`${API_BASE_URL}/gigs/${selectedGigId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete gig');
        }

        Swal.fire('Deleted!', 'The gig has been deleted.', 'success').then(() => {
          handleBackToList();
          fetchGigsByUserId(); // Refresh the list
        });
      } catch (err: any) {
        console.error("Error deleting gig:", err);
        Swal.fire('Error!', 'Failed to delete the gig.', 'error');
      }
    }
  };

  const handleEditGig = async () => {
    if (!selectedGigId || !gigDetails) return;
    
    setViewMode('edit');
    setEditedGig(gigDetails as Gig);
  };

  // Render gig details view
  if (viewMode === 'details') {
    if (loadingDetails) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gig details...</p>
          </div>
        </div>
      );
    }

    if (!gigDetails) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gig</h2>
            <p className="text-gray-600 mb-4">Gig not found</p>
            <button
              onClick={handleBackToList}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Gigs
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Gigs</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleEditGig}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDeleteGig}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{gigDetails.title || 'Untitled Gig'}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            {gigDetails.category && (
              <div className="flex items-center gap-2">
                <Tags size={18} />
                <span>{gigDetails.category}</span>
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
              <p className="text-gray-700 whitespace-pre-wrap">{gigDetails.description || 'No description provided.'}</p>
            </div>

            {/* Skills */}
            {gigDetails.skills && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="space-y-4">
                  {gigDetails.skills.professional && gigDetails.skills.professional.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Professional Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gigDetails.skills.professional.map((skill: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gigDetails.skills.technical && gigDetails.skills.technical.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gigDetails.skills.technical.map((skill: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gigDetails.skills.soft && gigDetails.skills.soft.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {gigDetails.skills.soft.map((skill: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || 'Unknown'}
                            {skill.level && ` (Level ${skill.level})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gigDetails.skills.languages && gigDetails.skills.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {gigDetails.skills.languages.map((lang: any, idx: number) => (
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
            {gigDetails.availability && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                <div className="space-y-3">
                  {gigDetails.availability.time_zone && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-gray-600" />
                      <span className="text-gray-700">Timezone: {getTimezoneInfo()}</span>
                    </div>
                  )}
                  {gigDetails.availability.flexibility && gigDetails.availability.flexibility.length > 0 && (
                    <div>
                      <span className="text-gray-700 font-medium">Flexibility: </span>
                      <span className="text-gray-600">{gigDetails.availability.flexibility.join(', ')}</span>
                    </div>
                  )}
                  {gigDetails.availability.schedule && gigDetails.availability.schedule.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Schedule</h3>
                      <div className="space-y-2">
                        {gigDetails.availability.schedule.map((schedule: any, idx: number) => (
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
            {gigDetails.seniority && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seniority</h2>
                <div className="space-y-2">
                  {gigDetails.seniority.level && (
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-gray-600" />
                      <span className="text-gray-700">Level: {gigDetails.seniority.level}</span>
                    </div>
                  )}
                  {gigDetails.seniority.yearsExperience && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-gray-600" />
                      <span className="text-gray-700">Experience: {gigDetails.seniority.yearsExperience} years</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commission */}
            {gigDetails.commission && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Commission</h2>
                <div className="space-y-2">
                  {gigDetails.commission.base && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-gray-600" />
                      <span className="text-gray-700">Base: {gigDetails.commission.base}</span>
                    </div>
                  )}
                  {gigDetails.commission.baseAmount && (
                    <div className="text-gray-700">Amount: {gigDetails.commission.baseAmount}</div>
                  )}
                  {gigDetails.commission.bonus && (
                    <div className="text-gray-700">Bonus: {gigDetails.commission.bonus}</div>
                  )}
                  {gigDetails.commission.bonusAmount && (
                    <div className="text-gray-700">Bonus Amount: {gigDetails.commission.bonusAmount}</div>
                  )}
                  {gigDetails.commission.currency && (
                    <div className="text-gray-700">Currency: {getCurrencyInfo()}</div>
                  )}
                  {gigDetails.commission.minimumVolume && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Minimum Volume:</div>
                      <div className="text-gray-700">
                        {gigDetails.commission.minimumVolume.amount} {gigDetails.commission.minimumVolume.unit} per {gigDetails.commission.minimumVolume.period}
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
                {gigDetails.createdAt && (
                  <div>Created: {new Date(gigDetails.createdAt).toLocaleDateString()}</div>
                )}
                {gigDetails.updatedAt && (
                  <div>Updated: {new Date(gigDetails.updatedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render gig edit view
  if (viewMode === 'edit' && editedGig) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setViewMode('details');
                setEditedGig(null);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Details</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setViewMode('details');
                  setEditedGig(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Gig</h1>
        </div>

        {/* Edit Form */}
        <div className="space-y-6">
          {/* Position Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Position Details</h3>
                  <p className="text-blue-100 text-sm">Define the role title and main responsibilities</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={editedGig.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-xl text-blue-900 font-medium focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-blue-400 transition-all border-blue-200"
                  placeholder="e.g., Senior Customer Service Representative"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
                <textarea
                  value={editedGig.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-xl text-blue-900 font-medium focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-blue-400 transition-all resize-none border-blue-200"
                  placeholder="Describe the role, key responsibilities, and what success looks like in this position..."
                />
              </div>
            </div>
          </div>

          {/* Role Category Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Role Category</h3>
                  <p className="text-purple-100 text-sm">Define the category and destination zone</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editedGig.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-2 rounded-xl text-purple-900 font-medium focus:outline-none focus:ring-3 focus:ring-purple-300 focus:border-purple-400 transition-all border-purple-200"
                  placeholder="Enter category"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destination Zone</label>
                <select
                  value={
                    typeof editedGig.destination_zone === 'string' 
                      ? editedGig.destination_zone 
                      : (typeof editedGig.destination_zone === 'object' && editedGig.destination_zone?._id
                        ? editedGig.destination_zone._id
                        : (typeof editedGig.destination_zone === 'object' && editedGig.destination_zone?.cca2
                          ? editedGig.destination_zone.cca2
                          : ''))
                  }
                  onChange={(e) => handleInputChange('destination_zone', e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800 appearance-none transition-all"
                >
                  <option value="" className="text-gray-400">Select a country</option>
                  {countries.map((country: any) => {
                    const countryId = country._id || country.cca2;
                    const countryName = country.name?.common || country.name || country.cca2;
                    return (
                      <option key={countryId} value={countryId}>
                        {countryName}
                      </option>
                    );
                  })}
                  {gigDetails?.destination_zone && typeof gigDetails.destination_zone === 'object' && 
                   !countries.find((c: any) => (c._id || c.cca2) === (gigDetails.destination_zone._id || gigDetails.destination_zone.cca2)) && (
                    <option value={gigDetails.destination_zone._id || gigDetails.destination_zone.cca2}>
                      {gigDetails.destination_zone.name?.common || gigDetails.destination_zone.name || gigDetails.destination_zone.cca2 || gigDetails.destination_zone._id}
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Industries & Activities Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Industries & Activities</h3>
                  <p className="text-green-100 text-sm">Select relevant industries and activities</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industries</label>
                <select
                  multiple
                  value={Array.isArray(editedGig.industries) 
                    ? editedGig.industries.map((ind: any) => typeof ind === 'object' ? ind._id : ind)
                    : []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleInputChange('industries', selected);
                  }}
                  className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 appearance-none transition-all min-h-[100px]"
                >
                  {industries.map((industry: any) => {
                    const indId = industry._id || industry.id;
                    return (
                      <option key={indId} value={indId}>
                        {industry.name || indId}
                      </option>
                    );
                  })}
                  {gigDetails?.industries && Array.isArray(gigDetails.industries) && gigDetails.industries
                    .filter((ind: any) => typeof ind === 'object' && ind._id && !industries.find((i: any) => i._id === ind._id))
                    .map((ind: any) => (
                      <option key={ind._id} value={ind._id}>
                        {ind.name || ind._id}
                      </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Activities</label>
                <select
                  multiple
                  value={Array.isArray(editedGig.activities)
                    ? editedGig.activities.map((act: any) => typeof act === 'object' ? act._id : act)
                    : []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleInputChange('activities', selected);
                  }}
                  className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 appearance-none transition-all min-h-[100px]"
                >
                  {activities.map((activity: any) => {
                    const actId = activity._id || activity.id;
                    return (
                      <option key={actId} value={actId}>
                        {activity.name || actId}
                      </option>
                    );
                  })}
                  {gigDetails?.activities && Array.isArray(gigDetails.activities) && gigDetails.activities
                    .filter((act: any) => typeof act === 'object' && act._id && !activities.find((a: any) => a._id === act._id))
                    .map((act: any) => (
                      <option key={act._id} value={act._id}>
                        {act.name || act._id}
                      </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
          </div>

          {/* Availability Section */}
          {editedGig.availability && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                    <Globe2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Availability</h3>
                    <p className="text-amber-100 text-sm">Set timezone and flexibility</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <select
                    value={
                      editedGig.availability && typeof editedGig.availability.time_zone === 'string' 
                        ? editedGig.availability.time_zone 
                        : (editedGig.availability && typeof editedGig.availability.time_zone === 'object' && editedGig.availability.time_zone?._id
                          ? editedGig.availability.time_zone._id
                          : '')
                    }
                    onChange={(e) => handleInputChange('availability.time_zone', e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-800 appearance-none transition-all"
                  >
                    <option value="" className="text-gray-400">Select timezone</option>
                    {timezones.map((tz: any) => {
                      const tzId = tz._id || tz.id;
                      const tzDisplay = tz.gmtDisplay || tz.name || tzId;
                      return (
                        <option key={tzId} value={tzId}>
                          {tzDisplay}
                        </option>
                      );
                    })}
                    {editedGig.availability && typeof editedGig.availability.time_zone === 'object' && editedGig.availability.time_zone?._id && 
                     !timezones.find((tz: any) => (tz._id || tz.id) === editedGig.availability?.time_zone?._id) && (
                      <option value={editedGig.availability.time_zone._id}>
                        {editedGig.availability.time_zone.gmtDisplay || editedGig.availability.time_zone.name || editedGig.availability.time_zone._id}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Flexibility</label>
                  <input
                    type="text"
                    value={Array.isArray(editedGig.availability.flexibility) 
                      ? editedGig.availability.flexibility.join(', ')
                      : (editedGig.availability.flexibility || '')}
                    onChange={(e) => {
                      const flexibilityArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      handleInputChange('availability.flexibility', flexibilityArray);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 rounded-xl text-amber-900 font-medium focus:outline-none focus:ring-3 focus:ring-amber-300 focus:border-amber-400 transition-all border-amber-200"
                    placeholder="e.g., Flexible Hours, Remote Work"
                  />
                  <p className="text-sm text-gray-500 mt-2">Separate multiple values with commas</p>
                </div>
              </div>
            </div>
          )}

          {/* Seniority Section */}
          {editedGig.seniority && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Seniority</h3>
                    <p className="text-emerald-100 text-sm">Define experience level and requirements</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                  <input
                    type="text"
                    value={editedGig.seniority.level || ''}
                    onChange={(e) => handleInputChange('seniority.level', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 rounded-xl text-emerald-900 font-medium focus:outline-none focus:ring-3 focus:ring-emerald-300 focus:border-emerald-400 transition-all border-emerald-200"
                    placeholder="e.g., Mid-Level"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="text"
                    value={editedGig.seniority.yearsExperience || ''}
                    onChange={(e) => handleInputChange('seniority.yearsExperience', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 rounded-xl text-emerald-900 font-medium focus:outline-none focus:ring-3 focus:ring-emerald-300 focus:border-emerald-400 transition-all border-emerald-200"
                    placeholder="e.g., 2 years"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Commission Section */}
          {editedGig.commission && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Commission</h3>
                    <p className="text-yellow-100 text-sm">Configure compensation structure</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base</label>
                  <input
                    type="text"
                    value={editedGig.commission.base || ''}
                    onChange={(e) => handleInputChange('commission.base', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                    placeholder="e.g., Base + Commission"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Amount</label>
                  <input
                    type="text"
                    value={editedGig.commission.baseAmount || ''}
                    onChange={(e) => handleInputChange('commission.baseAmount', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                    placeholder="e.g., 0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus</label>
                  <input
                    type="text"
                    value={editedGig.commission.bonus || ''}
                    onChange={(e) => handleInputChange('commission.bonus', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                    placeholder="e.g., Performance Bonus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Amount</label>
                  <input
                    type="text"
                    value={editedGig.commission.bonusAmount || ''}
                    onChange={(e) => handleInputChange('commission.bonusAmount', e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                    placeholder="e.g., 150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                  <select
                    value={
                      typeof editedGig.commission.currency === 'string' 
                        ? editedGig.commission.currency 
                        : (typeof editedGig.commission.currency === 'object' && editedGig.commission.currency?._id
                          ? editedGig.commission.currency._id
                          : '')
                    }
                    onChange={(e) => handleInputChange('commission.currency', e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-800 appearance-none transition-all"
                  >
                    <option value="" className="text-gray-400">Select currency</option>
                    {currencies.map((currency: any) => {
                      const currId = currency._id || currency.id;
                      const currDisplay = `${currency.symbol || ''} ${currency.code || ''} - ${currency.name || ''}`.trim() || currId;
                      return (
                        <option key={currId} value={currId}>
                          {currDisplay}
                        </option>
                      );
                    })}
                    {gigDetails?.commission?.currency && typeof gigDetails.commission.currency === 'object' && 
                     !currencies.find((c: any) => c._id === gigDetails.commission.currency._id) && (
                      <option value={gigDetails.commission.currency._id}>
                        {`${gigDetails.commission.currency.symbol || ''} ${gigDetails.commission.currency.code || ''} - ${gigDetails.commission.currency.name || ''}`.trim() || gigDetails.commission.currency._id}
                      </option>
                    )}
                  </select>
                </div>
                {editedGig.commission.minimumVolume && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Volume Amount</label>
                      <input
                        type="text"
                        value={editedGig.commission.minimumVolume.amount || ''}
                        onChange={(e) => handleInputChange('commission.minimumVolume.amount', e.target.value)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                        placeholder="e.g., 100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Volume Period</label>
                      <input
                        type="text"
                        value={editedGig.commission.minimumVolume.period || ''}
                        onChange={(e) => handleInputChange('commission.minimumVolume.period', e.target.value)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                        placeholder="e.g., month"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Volume Unit</label>
                      <input
                        type="text"
                        value={editedGig.commission.minimumVolume.unit || ''}
                        onChange={(e) => handleInputChange('commission.minimumVolume.unit', e.target.value)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 rounded-xl text-yellow-900 font-medium focus:outline-none focus:ring-3 focus:ring-yellow-300 focus:border-yellow-400 transition-all border-yellow-200"
                        placeholder="e.g., calls"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {editedGig.schedule && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 px-6 py-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Schedule</h3>
                    <p className="text-pink-100 text-sm">Define working days and hours</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {editedGig.schedule.schedules && editedGig.schedule.schedules.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Details</label>
                    {editedGig.schedule.schedules.map((schedule: any, idx: number) => (
                      <div key={idx} className="mb-4 p-3 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input
                            type="text"
                            value={schedule.day || ''}
                            onChange={(e) => {
                              const newSchedules = [...(editedGig.schedule?.schedules || [])];
                              newSchedules[idx] = { ...newSchedules[idx], day: e.target.value };
                              handleInputChange('schedule.schedules', newSchedules);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Day"
                          />
                          <input
                            type="time"
                            value={schedule.hours?.start || ''}
                            onChange={(e) => {
                              const newSchedules = [...(editedGig.schedule?.schedules || [])];
                              newSchedules[idx] = {
                                ...newSchedules[idx],
                                hours: { ...newSchedules[idx].hours, start: e.target.value }
                              };
                              handleInputChange('schedule.schedules', newSchedules);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="time"
                            value={schedule.hours?.end || ''}
                            onChange={(e) => {
                              const newSchedules = [...(editedGig.schedule?.schedules || [])];
                              newSchedules[idx] = {
                                ...newSchedules[idx],
                                hours: { ...newSchedules[idx].hours, end: e.target.value }
                              };
                              handleInputChange('schedule.schedules', newSchedules);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Gig Management</h2>
              {companyName && (
                <p className="text-sm text-gray-500">Company: {companyName}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => (window.location.href = "/app6")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Gig
          </button>
        </div>

        {/* Key Metrics Cards - Commented out */}
        {/* <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Active Gigs</span>
            </div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              12% increase
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold">$45,250</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              8% increase
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold">4.2m</div>
            <div className="text-sm text-red-600 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              3% decrease
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Rating</span>
            </div>
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              5% increase
            </div>
          </div>
        </div> */}

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            {["all", "available"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="pb-4 pt-4 px-4 font-semibold text-gray-700">Gig Details</th>
                  <th className="pb-4 pt-4 px-4 font-semibold text-gray-700">Category</th>
                  <th className="pb-4 pt-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredGigs && filteredGigs.length > 0 ? (
                  filteredGigs.map((gig, idx) => (
                    <tr key={gig._id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50`}>
                      <td className="py-4 px-4 align-middle">
                        <div>
                          <div className="font-semibold text-gray-900 text-base mb-1">
                            {gig?.title || 'No title'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {gig?.destination_zone ? getCountryName(gig.destination_zone) : 'No location specified'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium shadow-sm">
                          {gig?.category || 'Not specified'}
                        </span>
                      </td>
                      {/* <td className="py-4 px-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {gig?.skills?.professional?.length > 0 ? (
                            gig.skills.professional.map((skill: string) => (
                              <span key={skill} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No skills specified</span>
                          )}
                        </div>
                      </td> */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShow(gig)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(gig)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(gig._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No gigs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-fade-in">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out modal-slide-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalMode === 'edit' ? 'Edit Gig' : 'Gig Details'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                      {modalMode === 'edit' ? (
                        <input
                          type="text"
                          value={editedGig?.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium">{selectedGig.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                      {modalMode === 'edit' ? (
                        <input
                          type="text"
                          value={editedGig?.category || ''}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          {selectedGig.category}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                      <div className="flex items-center gap-2 text-gray-800">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        {getCountryName(selectedGig.destination_zone)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Commission Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Base Rate</label>
                      {modalMode === 'edit' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editedGig?.commission.baseAmount || ''}
                            onChange={(e) => handleInputChange('commission.baseAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Amount"
                          />
                          <select
                            value={editedGig?.commission.base || ''}
                            onChange={(e) => handleInputChange('commission.base', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="hour">per hour</option>
                            <option value="day">per day</option>
                            <option value="week">per week</option>
                            <option value="month">per month</option>
                          </select>
                        </div>
                      ) : (
                        <p className="text-gray-800 font-medium">
                          {selectedGig.commission.currency?.symbol || selectedGig.commission.currency?.code || '€'} {selectedGig.commission.baseAmount}/{selectedGig.commission.base}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGig.availability?.schedule?.map((schedule, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {schedule.day}
                        </span>
                      )) || <span className="text-gray-500">No schedule specified</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Hours</label>
                    <p className="text-gray-800">
                      {selectedGig.availability?.schedule?.[0]?.hours ? 
                        `${selectedGig.availability.schedule[0].hours.start} - ${selectedGig.availability.schedule[0].hours.end}` : 
                        'Hours not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Time Zone</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {selectedGig.availability?.time_zone?.zoneName || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Tags className="w-5 h-5 text-purple-500" />
                  Skills & Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Professional Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGig.skills?.professional?.map((skill: any, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || skill.name || 'Unknown skill')}
                        </span>
                      )) || <span className="text-gray-500">No professional skills specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Technical Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGig.skills?.technical?.map((skill: any, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || skill.name || 'Unknown skill')}
                        </span>
                      )) || <span className="text-gray-500">No technical skills specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Soft Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGig.skills?.soft?.map((skill: any, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : (typeof skill.skill === 'string' ? skill.skill : skill.skill?.name || skill.name || 'Unknown skill')}
                        </span>
                      )) || <span className="text-gray-500">No soft skills specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGig.skills?.languages?.map((lang: any, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {typeof lang === 'string' ? lang : (typeof lang.language === 'string' ? lang.language : lang.language?.name || lang.languageName || 'Unknown language')} ({typeof lang === 'string' ? 'N/A' : (lang.proficiency || 'N/A')})
                        </span>
                      )) || <span className="text-gray-500">No languages specified</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Seniority Level
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {selectedGig.seniority?.level || 'Not specified'}
                  </span>
                  <span className="text-gray-600">
                    ({selectedGig.seniority?.yearsExperience || '0'} years experience)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGig.industries?.map((industry, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {industry.name || 'Unknown industry'}
                    </span>
                  )) || <span className="text-gray-500">No industries specified</span>}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  Activities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGig.activities?.map((activity, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {activity.name || 'Unknown activity'}
                    </span>
                  )) || <span className="text-gray-500">No activities specified</span>}
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GigsPanel;

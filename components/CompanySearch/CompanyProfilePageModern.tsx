"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  MapPin,
  Globe,
  Trophy,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Factory,
  ArrowLeft,
  Award,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "./api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

export function CompanyProfilePageModern({ profile: initialProfile, onBackToSearch }: Props) {
  const [showUniquenessPanel, setShowUniquenessPanel] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  // Log initial profile load
  React.useEffect(() => {
    console.log('🏢 [Profile] Company profile page loaded:', {
      companyName: initialProfile.name,
      industry: initialProfile.industry,
      hasLogo: !!initialProfile.logo,
      hasContact: !!initialProfile.contact,
      hasCulture: !!initialProfile.culture,
      valuesCount: initialProfile.culture?.values?.length || 0,
      benefitsCount: initialProfile.culture?.benefits?.length || 0,
      profileKeys: Object.keys(initialProfile),
      hasId: !!initialProfile._id,
      isNewProfile: !initialProfile._id
    });

  }, [initialProfile]);

  const hasContactInfo =
    profile.contact?.email ||
    profile.contact?.phone ||
    profile.contact?.address ||
    profile.contact?.website;

  const hasSocialMedia =
    profile.socialMedia?.linkedin ||
    profile.socialMedia?.twitter ||
    profile.socialMedia?.facebook ||
    profile.socialMedia?.instagram;

  const hasLocation =
    profile.contact?.coordinates?.lat && profile.contact?.coordinates?.lng;

  const getGoogleMapsUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) return null;

    if (profile.contact?.address) {
      const address = encodeURIComponent(profile.contact.address);
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}&zoom=15`;
    }

    if (hasLocation && profile.contact?.coordinates) {
      const { lat, lng } = profile.contact.coordinates;
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    }

    return null;
  };

  const getGoogleMapsDirectionsUrl = () => {
    if (profile.contact?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        profile.contact.address
      )}`;
    }

    if (hasLocation && profile.contact?.coordinates) {
      const { lat, lng } = profile.contact.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    return null;
  };

  const getLogoUrl = () => {
    if (profile.logo) return profile.logo;
    
    if (profile.contact?.website) {
      try {
        const domain = new URL(profile.contact.website).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch {
        return null;
      }
    }
    
    return null;
  };

  const handleFieldClick = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleFieldSave = async (field: string) => {
    console.log('💾 [Profile] Saving field:', { 
      field, 
      oldValue: getFieldValue(field),
      newValue: tempValue 
    });

    const updateProfile = (path: string[], value: any) => {
      const newProfile = { ...profile };
      let current = newProfile as any;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newProfile;
    };

    const fieldPath = field.split(".");
    const updatedProfile = updateProfile(fieldPath, tempValue);
    
    // Mise à jour locale immédiate pour une meilleure UX
    setProfile(updatedProfile);
    setEditingField(null);

    console.log('✅ [Profile] Field saved locally:', { 
      field, 
      newValue: tempValue,
      profileUpdated: true
    });
  };

  const getFieldValue = (field: string) => {
    const fieldPath = field.split(".");
    let current = profile as any;
    for (const key of fieldPath) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const handleKeyDown = async (e: React.KeyboardEvent, field: string) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await handleFieldSave(field);
      }
      if (e.key === 'Escape') {
        setEditingField(null);
      }
  };


  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📷 [Profile] Logo upload started:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const updatedProfile = { ...profile, logo: result };
        setProfile(updatedProfile);
        setShowLogoEditor(false);
        
        console.log('✅ [Profile] Logo uploaded successfully:', {
          fileName: file.name,
          dataSize: result.length,
          logoSet: true
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlSave = () => {
    console.log('🌐 [Profile] Logo URL save:', {
      logoUrl: logoUrl.trim(),
      hasUrl: !!logoUrl.trim()
    });

    if (logoUrl.trim()) {
      const updatedProfile = { ...profile, logo: logoUrl.trim() };
      setProfile(updatedProfile);
      
      console.log('✅ [Profile] Logo URL saved successfully:', {
        logoUrl: logoUrl.trim()
      });
    }
    setShowLogoEditor(false);
    setLogoUrl("");
  };

  const EditableText = ({ 
    value, 
    field, 
    className = "", 
    multiline = false,
    placeholder = "Click to edit..."
  }: {
    value: string;
    field: string;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      // Create base classes while preserving original styling but override text color
      const baseEditingClasses = "border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white !text-gray-900";
      
      // Remove any text color classes from className to avoid conflicts
      const classNameWithoutTextColor = className.replace(/text-\w+-\w+/g, '').replace(/text-white/g, '').trim();
      
      // Check if this is a tag field (small inline fields in hero section)
      const isTagField = field === 'industry' || field === 'founded' || field === 'headquarters';
      const inputSizing = isTagField ? 'px-2 py-1' : 'px-3 py-2';
      const inputWidth = isTagField ? '' : 'w-full';
      
      return multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleFieldSave(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className={`${classNameWithoutTextColor} ${baseEditingClasses} min-h-[100px] w-full px-3 py-2 resize-y`}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleFieldSave(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className={`${classNameWithoutTextColor} ${baseEditingClasses} ${inputWidth} ${inputSizing}`}
          placeholder={placeholder}
          autoFocus
          style={isTagField ? { minWidth: '60px', maxWidth: '200px' } : {}}
        />
      );
    }

    // Check if this field contains a URL (website, email, or phone)
    const isClickableField = field.includes('website') || field.includes('email') || field.includes('phone');
    const isUrl = value && (value.startsWith('http') || value.startsWith('mailto:') || value.includes('@') || value.startsWith('tel:'));
    
    if (isClickableField && isUrl && !editingField) {
      // Render as clickable link for website/email/phone fields
      let href = value;
      if (field.includes('email') && !value.startsWith('mailto:')) {
        href = `mailto:${value}`;
      } else if (field.includes('phone') && !value.startsWith('tel:')) {
        href = `tel:${value}`;
      }
      
      return (
        <a
          href={href}
          target={field.includes('website') ? '_blank' : undefined}
          rel={field.includes('website') ? 'noopener noreferrer' : undefined}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFieldClick(field, value);
          }}
          className={`${className} rounded-lg px-3 py-2 border border-transparent min-h-[2rem] flex items-center underline cursor-pointer`}
          title="Single click to visit, double click to edit"
        >
          {value}
        </a>
      );
    }

    return (
      <div
        onClick={() => handleFieldClick(field, value)}
        className={`${className} cursor-pointer rounded-lg px-3 py-2 border border-transparent ${!value ? 'text-gray-400 italic' : ''} min-h-[2rem] flex items-center`}
        title="Click to edit"
      >
        {value || placeholder}
      </div>
    );
  };

  if (showUniquenessPanel) {
    console.log('⭐ [Profile] Showing uniqueness panel for:', {
      companyName: profile.name,
      industry: profile.industry
    });

    return (
      <UniquenessPanel
        profile={profile}
        onBack={() => {
          console.log('🔙 [Profile] Returning from uniqueness panel');
          setShowUniquenessPanel(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full px-6 py-2">
            <div className="flex items-center justify-between">
               <button
                 onClick={onBackToSearch}
                 className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
               >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Search</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.industry}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Hero Section */}
       <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 overflow-hidden">
         <div className="absolute inset-0">
           <div className="absolute inset-0 bg-black/20"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
           {/* Pattern overlay */}
           <div className="absolute inset-0 opacity-10" style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
             backgroundSize: '20px 20px'
           }}></div>
         </div>
        
        <div className="relative w-full px-6 py-8">
          <div className="flex items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex items-start gap-8">
              {/* Logo Column */}
              <div className="flex-shrink-0">
                <div 
                  className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
                  onClick={() => setShowLogoEditor(true)}
                >
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()!}
                      alt={profile.name}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-white" />
                  )}
                  
                  {/* Edit overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Edit Logo</span>
                  </div>
                </div>
              </div>

              {/* Company Info Column */}
              <div className="flex-1 text-white">
                <EditableText
                  value={profile.name}
                  field="name"
                  className="text-4xl font-bold mb-4 text-white block w-full"
                  placeholder="Company Name"
                  multiline={false}
                />
                <div className="flex flex-wrap gap-2 text-white/90">
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-sm">
                    <Factory size={14} />
                    <EditableText
                      value={profile.industry || ''}
                      field="industry"
                      className="text-white/90 text-sm"
                      placeholder="Industry"
                      multiline={false}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-sm">
                    <Calendar size={14} />
                    <span>Founded </span>
                    <EditableText
                      value={profile.founded || ''}
                      field="founded"
                      className="text-white/90 text-sm"
                      placeholder="Year"
                      multiline={false}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-sm">
                    <MapPin size={14} />
                    <EditableText
                      value={profile.headquarters || ''}
                      field="headquarters"
                      className="text-white/90 text-sm"
                      placeholder="Headquarters"
                      multiline={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Button - Fixed Position */}
            <div className="flex-shrink-0">
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={() => setShowUniquenessPanel(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
                >
                  <Trophy size={18} />
                  <span className="hidden sm:inline">Discover What Makes Us Unique</span>
                  <span className="sm:hidden">Unique</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>


       {/* Main Content */}
       <div className="w-full px-6 py-6 overflow-hidden">
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 min-w-0">
            {/* Company Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 min-w-0">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                   <Building2 className="text-indigo-600" size={20} />
                 </div>
                <h2 className="text-xl font-bold text-gray-900">Company Overview</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <EditableText
                  value={profile.overview}
                  field="overview"
                  className="text-gray-700 leading-relaxed text-base block w-full min-h-[100px]"
                  multiline={true}
                  placeholder="Click to add company overview..."
                />
              </div>
            </div>

            {/* Mission */}
            {profile.mission && (
               <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                     <Trophy className="text-white" size={20} />
                   </div>
                  <h2 className="text-xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <EditableText
                  value={profile.mission || ''}
                  field="mission"
                  className="text-gray-700 leading-relaxed text-base font-medium block w-full min-h-[60px]"
                  multiline={true}
                  placeholder="Click to add mission statement..."
                />
              </div>
            )}

             {/* Values & Benefits */}
             <div className="grid md:grid-cols-2 gap-6">
               {profile.culture?.values && profile.culture.values.length > 0 && (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                       <Trophy className="text-indigo-600" size={16} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Core Values</h3>
                   </div>
                   <div className="space-y-2">
                     {profile.culture?.values?.map((value, index) => (
                       <div key={index} className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                         <EditableText
                           value={value}
                           field={`culture.values.${index}`}
                           className="text-gray-700 font-medium flex-1"
                           placeholder="Core value..."
                         />
                       </div>
                     )) || (
                       <EditableText
                         value=""
                         field="culture.values.0"
                         className="text-gray-700 font-medium"
                         placeholder="Click to add core values..."
                       />
                     )}
                   </div>
                 </div>
               )}

               {profile.culture?.benefits && profile.culture.benefits.length > 0 && (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                       <Award className="text-green-600" size={16} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Benefits & Perks</h3>
                   </div>
                   <div className="space-y-2">
                     {profile.culture?.benefits?.map((benefit, index) => (
                       <div key={index} className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                         <EditableText
                           value={benefit}
                           field={`culture.benefits.${index}`}
                           className="text-gray-700 font-medium flex-1"
                           placeholder="Benefit or perk..."
                         />
                       </div>
                     )) || (
                       <EditableText
                         value=""
                         field="culture.benefits.0"
                         className="text-gray-700 font-medium"
                         placeholder="Click to add benefits..."
                       />
                     )}
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Contact Information */}
            {hasContactInfo && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                   <Mail className="text-indigo-600" size={20} />
                   Contact Information
                 </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.email || ''}
                      field="contact.email"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600"
                      placeholder="email@company.com"
                      multiline={false}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.phone || 'Téléphone non trouvé - Cliquez pour ajouter manuellement'}
                      field="contact.phone"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600"
                      placeholder="Téléphone non trouvé - Cliquez pour ajouter manuellement"
                      multiline={false}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.website || ''}
                      field="contact.website"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600"
                      placeholder="https://company.com"
                      multiline={false}
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <EditableText
                      value={profile.contact?.address || ''}
                      field="contact.address"
                      className="text-sm flex-1 text-gray-600 min-h-[60px] block w-full leading-relaxed"
                      multiline={true}
                      placeholder="Company address..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Media */}
            {hasSocialMedia && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-w-0">
                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                   <Globe className="text-indigo-600" size={20} />
                   Follow Us
                 </h3>
                <div className="flex gap-3">
                  {profile.socialMedia?.linkedin && (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.twitter && (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.facebook && (
                    <a
                      href={profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.instagram && (
                    <a
                      href={profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {(profile.contact?.address || hasLocation) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                 <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <MapPin className="text-indigo-600" size={20} />
                   Location
                 </h3>
                <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                  {getGoogleMapsUrl() ? (
                    <>
                      <iframe
                        src={getGoogleMapsUrl()!}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                      />
                      {getGoogleMapsDirectionsUrl() && (
                        <a
                          href={getGoogleMapsDirectionsUrl()!}
                          target="_blank"
                          rel="noopener noreferrer"
                           className="absolute bottom-3 right-3 px-3 py-2 bg-white hover:bg-gray-50 text-sm text-indigo-600 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <MapPin size={14} />
                          Get Directions
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <span>Map not available</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logo Editor Modal */}
      {showLogoEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Company Logo</h3>
              <button
                onClick={() => {
                  setShowLogoEditor(false);
                  setLogoUrl("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Logo Preview */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()!}
                      alt="Logo preview"
                      className="w-14 h-14 object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">Current Logo</p>
              </div>

              {/* Upload Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, SVG
                </p>
              </div>

              {/* Or divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogoUrlSave();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Enter a direct URL to an image file
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLogoEditor(false);
                    setLogoUrl("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoUrlSave}
                  disabled={!logoUrl.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




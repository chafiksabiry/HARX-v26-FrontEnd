"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { googleApi, type GoogleSearchResult } from '@/lib/company/google';
import { generateCompanyProfile, searchCompanyLogo, type CompanyProfile } from '@/lib/company/api';
import { CompanyProfilePageModern as CompanyProfilePage } from '@/components/onboarding/company/CompanyProfilePageModern';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [logoCache, setLogoCache] = useState<Record<string, string>>({});
  const [showProfilePage, setShowProfilePage] = useState(false);

  useEffect(() => {
    const checkUserCompany = async () => {
      const userId = Cookies.get('userId');
      
      if (userId) {
        try {
          // Utiliser le service API qui pointe vers le backend (port 5000)
          const { companies } = await import('@/lib/api');
          const companyData = await companies.getByUserId(userId);
          
          // L'intercepteur gère les 404 silencieusement, donc companyData peut avoir success: false
          if (companyData && companyData.success && companyData.data && companyData.data._id) {
            setRedirectMessage('You already have a company profile. Redirecting...');
            setTimeout(() => {
              // Redirect to company orchestrator
              const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
              if (compOrchestratorUrl.startsWith('http')) {
                window.location.href = compOrchestratorUrl;
              } else {
                router.push(compOrchestratorUrl);
              }
            }, 2000);
          } else {
            // No company found, which is fine - user can create one
            // L'intercepteur a déjà géré le 404 silencieusement
            // Pas besoin de logger, c'est un cas normal
          }
        } catch (error: any) {
          // Si erreur autre que 404 (qui est déjà gérée par l'intercepteur)
          if (error.response?.status === 401) {
            console.warn('Unauthorized: Token may be invalid or expired');
            // Optionally redirect to login or clear token
          } else {
            // Seulement logger les erreurs non-404
            console.error('Error checking user company:', error);
          }
        }
      } else {
        console.warn('No user ID found');
      }
    };
  
    checkUserCompany();
  }, [router]);
  

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log('🔍 [App] Starting company search:', { query: searchQuery });
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setCompanyProfile(null);

    try {
      const results = await googleApi.search(searchQuery);
      
      console.log('✅ [App] Search results received:', {
        resultsCount: results.length,
        companies: results.map(r => ({
          title: r.title,
          domain: (() => {
            try {
              return new URL(r.link).hostname;
            } catch {
              return 'unknown';
            }
          })()
        }))
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error('💥 [App] Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = async (result: GoogleSearchResult) => {
    console.log('🎯 [App] Company selected for profile generation:', {
      title: result.title,
      link: result.link,
      snippet: result.snippet?.substring(0, 100) + '...'
    });

    setIsLoading(true);
    setError(null);
    
    try {
      const companyInfo = `
        Company Name: ${result.title}
        Website: ${result.link}
        Description: ${result.snippet}
        Additional Info: ${result.pagemap?.metatags?.[0]?.['og:description'] || ''}
      `.trim();
      
      console.log('📝 [App] Company info prepared for OpenAI:', {
        companyInfoLength: companyInfo.length,
        companyInfo: companyInfo.substring(0, 200) + '...'
      });
      
      const profile = await generateCompanyProfile(companyInfo);
      
      console.log('✅ [App] Company profile generated successfully:', {
        companyName: profile.name,
        industry: profile.industry,
        hasLogo: !!profile.logo,
        hasContact: !!profile.contact,
        hasCulture: !!profile.culture,
        valuesCount: profile.culture?.values?.length || 0,
        benefitsCount: profile.culture?.benefits?.length || 0,
        hasCompanyIntro: !!profile.companyIntro
      });
      
      setCompanyProfile(profile);
      setShowProfilePage(true);
      
      console.log('🔄 [App] Switched to profile page view');
    } catch (err) {
      console.error('💥 [App] Profile generation error:', err);
      setError('Failed to generate company profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si on affiche la page de profil, on affiche seulement celle-ci
  if (showProfilePage && companyProfile) {
    return (
      <CompanyProfilePage
        profile={companyProfile}
        onBackToSearch={() => {
          setShowProfilePage(false);
          setCompanyProfile(null);
          setSearchResults([]);
          setSearchQuery('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="text-center mb-8">
            {/* 
          <Image
            src="/assets/harx-blanc.jpg" // Note: Need to make sure this asset exists
            alt="Harx Logo" 
            width={64}
            height={64}
            className="mx-auto mb-6 h-16 w-auto"
          />
            */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Profile Search</h1>
          <p className="text-lg text-gray-600">
            Search for companies and generate detailed profiles with unique insights
          </p>
        </div>
         {/* 🔔 Add your message here */}
  {redirectMessage && (
    <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center text-sm">
      {redirectMessage}
    </div>
  )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter company name..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 disabled:text-gray-300"
            >
              <Search size={20} />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              searchResults.map((result, index) => {
                // Ordre de fallback : og:image > cache > OpenAI > Clearbit > Google Favicon > logo par défaut
                let logoUrl = result.pagemap?.metatags?.[0]?.['og:image'];
                const cacheKey = `${result.title}-${result.link}`;
                if (!logoUrl) {
                  logoUrl = logoCache[cacheKey];
                  if (!logoUrl) {
                    // Start async logo fetch logic (simplified for React useEffect/state pattern)
                    // Note: In React, we can't easily do side effects inside render.
                    // We will rely on an effect or just load it when visible if we wanted to be strict.
                    // However, we can use a self-invoking function that updates state if we are careful about infinite loops.
                    // But simpler here is to trigger logo fetch when results are set or just do it inline with a small component.
                    
                    // For now, let's just use the logic from the original App.tsx but wrapping it in a component or effect is better.
                    // We'll leave the complexity of per-item async fetching for later or simple improvement.
                    // A better pattern is to have a CompanyResultItem component that handles its own logo fetching.
                  }
                }
                
                return (
                    <CompanyResultItem 
                        key={index} 
                        result={result} 
                        onSelect={handleSelectResult} 
                        initialLogoUrl={logoUrl}
                        cacheKey={cacheKey}
                        onLogoFound={(key, url) => setLogoCache(prev => ({ ...prev, [key]: url }))}
                    />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyResultItem({ 
    result, 
    onSelect, 
    initialLogoUrl, 
    cacheKey, 
    onLogoFound 
}: { 
    result: GoogleSearchResult, 
    onSelect: (r: GoogleSearchResult) => void, 
    initialLogoUrl?: string, 
    cacheKey: string,
    onLogoFound: (key: string, url: string) => void
}) {
    const [logoUrl, setLogoUrl] = useState<string | undefined>(initialLogoUrl);
    const [isLoadingLogo, setIsLoadingLogo] = useState(!initialLogoUrl);

    useEffect(() => {
        if (logoUrl) return;

        let isMounted = true;
        const fetchLogo = async () => {
            try {
                const domain = (() => {
                    try {
                        return new URL(result.link).hostname;
                    } catch {
                        return null;
                    }
                })();
                
                if (!domain) {
                    if (isMounted) {
                        setLogoUrl('default');
                        setIsLoadingLogo(false);
                    }
                    return;
                }

                // 1. Try AI Logo Search first (if enabled/needed)
                // const aiLogoUrl = await searchCompanyLogo(result.title, result.link);
                // if (aiLogoUrl && isMounted) {
                //     setLogoUrl(aiLogoUrl);
                //     onLogoFound(cacheKey, aiLogoUrl);
                //     setIsLoadingLogo(false);
                //     return;
                // }

                // 2. Fallback Clearbit
                const clearbitUrl = `https://logo.clearbit.com/${domain}`;
                const testImg = new window.Image();
                testImg.onload = () => {
                    if (isMounted) {
                        setLogoUrl(clearbitUrl);
                        onLogoFound(cacheKey, clearbitUrl);
                        setIsLoadingLogo(false);
                    }
                };
                testImg.onerror = () => {
                     // 3. Fallback Google Favicon
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    if (isMounted) {
                        setLogoUrl(faviconUrl);
                        onLogoFound(cacheKey, faviconUrl);
                        setIsLoadingLogo(false);
                    }
                };
                testImg.src = clearbitUrl;

            } catch (e) {
                if (isMounted) {
                    setLogoUrl('default');
                    setIsLoadingLogo(false);
                }
            }
        };

        fetchLogo();

        return () => { isMounted = false; };
    }, [result, logoUrl, cacheKey, onLogoFound]);

    return (
        <div className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
            <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl && logoUrl !== 'default' ? (
                <img
                    src={logoUrl}
                    alt={result.title}
                    className="w-full h-full object-contain"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                ) : logoUrl === 'default' ? (
                <Building2 className="text-indigo-600" size={28} />
                ) : (
                <div className="w-6 h-6 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {result.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{result.snippet}</p>
                <button
                onClick={() => onSelect(result)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                Generate Profile
                </button>
            </div>
            </div>
        </div>
    );
}


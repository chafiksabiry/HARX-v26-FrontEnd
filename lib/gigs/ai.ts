import { GigData, GigSuggestion } from '@/types/gigs';
// import { generateMockGigSuggestions } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Configuration pour activer/désactiver le mode mock
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false;

// Helper function to validate and clean territory IDs
// Removes timezone IDs that might have been incorrectly included in territories
function validateTerritories(territories: string[], timezoneId?: string): string[] {
  if (!territories || !Array.isArray(territories)) return [];
  
  // Filter out timezone ID if it appears in territories
  return territories.filter(territoryId => {
    // Remove the timezone ID if it appears in territories
    if (timezoneId && territoryId === timezoneId) {
      console.warn(`⚠️ Timezone ID ${timezoneId} found in territories, removing it`);
      return false;
    }
    return true;
  });
}

export async function generateGigSuggestions(description: string): Promise<GigSuggestion> {
  if (!description) {
    throw new Error('Description is required');
  }

  // Si le mode mock est activé, utiliser les données mockées
  if (USE_MOCK_DATA) {
    console.log('🎭 MOCK MODE ENABLED - Using mock data instead of OpenAI API');
    // return await generateMockGigSuggestions(description);
    throw new Error("Mock data not implemented");
  }

  try {
    console.log('🤖 REAL API MODE - Calling OpenAI backend');
    const response = await fetch(`${API_BASE_URL}/ai/gigs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Log the backend response for debugging
    console.log('Backend API Response:', responseData);

    if (!responseData.success || !responseData.data) {
        throw new Error(responseData.message || "Failed to generate suggestions");
    }
    
    const data = responseData.data;
    
    // Log industries, activities, timezone, skills, languages, and currency for debugging
    console.log('🏭 INDUSTRIES - Raw data from backend:', data.industries);
    console.log('🎯 ACTIVITIES - Raw data from backend:', data.activities);
    console.log('🕐 TIMEZONE - Raw data from backend:', data.availability?.time_zone);
    console.log('💬 LANGUAGES - Raw data from backend:', data.skills?.languages);
    console.log('🧠 SOFT SKILLS - Raw data from backend:', data.skills?.soft);
    console.log('💼 PROFESSIONAL SKILLS - Raw data from backend:', data.skills?.professional);
    console.log('⚙️ TECHNICAL SKILLS - Raw data from backend:', data.skills?.technical);
    console.log('💰 CURRENCY - Raw data from backend:', data.commission?.currency);
    
    // Transform the backend response to match our GigSuggestion type
    const timezoneId = data.availability?.time_zone;
    const originalTerritories = data.team?.territories || [];
    const cleanedTerritories = validateTerritories(originalTerritories, timezoneId);
    
    // Log if territories were cleaned
    if (originalTerritories.length !== cleanedTerritories.length) {
      console.log(`🧹 Cleaned territories: ${originalTerritories.length} → ${cleanedTerritories.length}`);
      console.log('Original:', originalTerritories);
      console.log('Cleaned:', cleanedTerritories);
    }
    
    const transformedData: GigSuggestion = {
      title: data.jobTitles?.[0] || data.jobDescription || '',
      description: data.jobDescription || '',
      category: data.category || '',
      highlights: data.highlights || [],
      jobTitles: data.jobTitles || [],
      deliverables: data.deliverables || [],
      selectedJobTitle: data.jobTitles?.[0],
      sectors: data.category ? [data.category] : [],
      industries: Array.isArray(data.industries) ? data.industries : [],
      activities: Array.isArray(data.activities) ? data.activities : [],
      destinationZones: data.destination_zone ? [data.destination_zone] : [],
      timeframes: data.timeframes || [],
      availability: {
        schedule: data.availability?.schedule ? data.availability.schedule.map((sched: any) => ({
          days: Array.isArray(sched.days) ? sched.days : [sched.day],
          hours: sched.hours || { start: '', end: '' }
        })) : [],
        timeZones: data.availability?.time_zone ? [data.availability.time_zone] : [],
        time_zone: data.availability?.time_zone || '',
        flexibility: data.availability?.flexibility || [],
        minimumHours: data.availability?.minimumHours || { daily: 0, weekly: 0, monthly: 0 }
      },
      schedule: {
        schedules: data.availability?.schedule ? data.availability.schedule.map((sched: any) => ({
          day: Array.isArray(sched.days) ? sched.days[0] : sched.day,
          hours: sched.hours || { start: '', end: '' }
        })) : [],
        timeZones: data.availability?.time_zone ? [data.availability.time_zone] : [],
        time_zone: data.availability?.time_zone || '',
        flexibility: data.availability?.flexibility || [],
        minimumHours: data.availability?.minimumHours || { daily: 0, weekly: 0, monthly: 0 }
      },
      requirements: { essential: [], preferred: [] },
      benefits: data.benefits || [],
      skills: data.skills || { languages: [], soft: [], professional: [], technical: [], certifications: [] },
      seniority: data.seniority || { level: '', yearsExperience: 0 },
      team: {
        size: data.team?.size || 1,
        structure: data.team?.structure || [],
        territories: cleanedTerritories,
        reporting: data.team?.reporting || { to: '', frequency: '' },
        collaboration: data.team?.collaboration || []
      },
      commission: data.commission || {
        base: '',
        baseAmount: 0,
        currency: '',
        minimumVolume: { amount: 0, period: '', unit: '' },
        transactionCommission: { type: '', amount: 0 }
      },
      activity: data.activity || { options: [] },
      leads: data.leads || {
        types: [],
        sources: [],
        distribution: { method: '', rules: [] },
        qualificationCriteria: []
      },
      documentation: data.documentation || {
        templates: null,
        reference: null,
        product: [],
        process: [],
        training: []
      }
    };

    console.log('Transformed data for UI:', transformedData);
    console.log('🏭 INDUSTRIES - Transformed industries:', transformedData.industries);
    console.log('🎯 ACTIVITIES - Transformed activities:', transformedData.activities);
    console.log('🕐 TIMEZONE - Transformed timezone:', transformedData.availability?.time_zone);
    console.log('💬 LANGUAGES - Transformed languages:', transformedData.skills?.languages);
    console.log('🧠 SOFT SKILLS - Transformed soft skills:', transformedData.skills?.soft);
    console.log('💼 PROFESSIONAL SKILLS - Transformed professional skills:', transformedData.skills?.professional);
    console.log('⚙️ TECHNICAL SKILLS - Transformed technical skills:', transformedData.skills?.technical);
    console.log('💰 CURRENCY - Transformed currency:', transformedData.commission?.currency);
    return transformedData;
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw error;
  }
}

// Convert GigData back to GigSuggestion format for the Suggestions component
export function mapGigDataToSuggestions(gigData: GigData): any {
  console.log('🔄 REVERSE MAPPING - Converting gigData back to suggestions format');
  console.log('🔄 REVERSE MAPPING - gigData.schedule:', gigData.schedule);
  console.log('🔄 REVERSE MAPPING - gigData.availability:', gigData.availability);
  
  return {
    jobTitles: gigData.title ? [gigData.title] : [],
    description: gigData.description || '',
    category: gigData.category || '',
    destinationZones: gigData.destinationZones || [],
    activities: gigData.activities || [],
    industries: gigData.industries || [],
    seniority: gigData.seniority || { level: '', yearsExperience: 0 },
    skills: {
      languages: gigData.skills?.languages || [],
      soft: gigData.skills?.soft || [],
      professional: gigData.skills?.professional || [],
      technical: gigData.skills?.technical || [],
      certifications: [] // GigData doesn't have certifications in skills
    },
    schedule: gigData.schedule || {
      schedules: [],
      time_zone: '',
      timeZones: [],
      flexibility: [],
      minimumHours: {}
    },
    availability: gigData.availability || {},
    commission: gigData.commission ? {
      ...gigData.commission,
      kpis: gigData.commission?.kpis || []
    } : {},
    team: gigData.team || { size: 1, structure: [], territories: [] },
    highlights: gigData.highlights || [],
    requirements: gigData.requirements || { essential: [], preferred: [] },
    benefits: gigData.benefits || [],
    callTypes: gigData.callTypes || []
  };
}

// Keep the mapGeneratedDataToGigData function for compatibility
export function mapGeneratedDataToGigData(generatedData: any): Partial<GigData> {
  console.log('🗺️ MAPPING - generatedData.schedule:', generatedData.schedule);
  console.log('🗺️ MAPPING - generatedData.availability:', generatedData.availability);
  console.log('🗺️ MAPPING - generatedData.destination_zone:', generatedData.destination_zone);
  console.log('🗺️ MAPPING - generatedData.destinationZones:', generatedData.destinationZones);
  
  const mappedDestinationZone = generatedData.destination_zone || generatedData.destinationZones?.[0] || '';
  console.log('🗺️ MAPPING - Final destination_zone:', mappedDestinationZone);
  
  return {
    title: generatedData.jobTitles?.[0] || '',
    description: generatedData.description || '',
    category: generatedData.category || '',
    seniority: generatedData.seniority || { level: '', yearsExperience: 0 },
    activities: generatedData.activities || [],
    industries: generatedData.industries || [],
    skills: generatedData.skills || { languages: [], soft: [], professional: [], technical: [] } as any,
    availability: generatedData.availability || {},
    schedule: generatedData.schedule || {
      schedules: [],
      time_zone: '',
      timeZones: [],
      flexibility: [],
      minimumHours: {}
    },
    commission: generatedData.commission || {} as any,
    team: generatedData.team || { size: 1, structure: [], territories: [] },
    destination_zone: mappedDestinationZone
  };
}

export async function analyzeTitleAndGenerateDescription(title: string) {
    const suggestions = await generateGigSuggestions(title); // Using title as description for now
    return mapGeneratedDataToGigData(suggestions);
}

export async function generateSkills(title: string, description: string) {
    const suggestions = await generateGigSuggestions(`${title} ${description}`);
    return suggestions.skills;
}

// REP Wizard API service for harx2-frontend
import { api } from '@/lib/api';

export interface Timezone {
  _id: string;
  countryCode?: string;
  countryName?: string;
  zoneName?: string;
  name?: string;
  gmtOffset?: number;
  offset?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimezoneResponse {
  success: boolean;
  data: Timezone[];
}

export interface Country {
  _id: string;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  iso2?: string;
  iso3?: string;
  countryCode?: string;
  countryName?: string;
}

export interface CountryResponse {
  success: boolean;
  data: Country[];
}

class RepWizardApiService {
  // Timezone endpoints
  async getTimezones(): Promise<Timezone[]> {
    try {
      const response = await api.get('/timezones');
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching timezones:', error);
      return [];
    }
  }

  async getCountries(): Promise<Country[]> {
    try {
      const response = await api.get('/countries');
      let countriesData: any[] = [];
      
      if (response.data?.success && response.data.data) {
        countriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        countriesData = response.data;
      } else {
        return [];
      }

      // Transform backend country format to frontend format
      // Backend format: { name: { common: string, official: string }, cca2: string }
      // Frontend format: { countryName: string, countryCode: string, name: string, code: string }
      const transformedCountries = countriesData.map((country: any) => {
        // Handle different backend formats
        const countryName = country.name?.common || country.name?.official || country.name || country.countryName || '';
        const countryCode = country.cca2 || country.code || country.countryCode || country.iso2 || '';
        
        return {
          _id: country._id || country.id || '',
          name: countryName,
          countryName: countryName,
          code: countryCode,
          countryCode: countryCode,
          // Keep original data for compatibility
          ...country
        };
      }).filter(country => country.countryName && country.countryCode); // Filter out invalid entries

      console.log('🌍 Transformed countries:', transformedCountries.length);
      return transformedCountries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback: try to get countries from timezones
      try {
        const timezones = await this.getTimezones();
        // Extract unique countries from timezones
        const uniqueCountries = timezones
          .filter((tz, index, self) => 
            tz.countryCode && 
            index === self.findIndex(t => t.countryCode === tz.countryCode)
          )
          .map(tz => ({
            _id: tz._id,
            name: tz.countryName || tz.name || '',
            code: tz.countryCode || '',
            countryCode: tz.countryCode,
            countryName: tz.countryName || tz.name
          }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        console.log('🌍 Using fallback countries from timezones:', uniqueCountries.length);
        return uniqueCountries;
      } catch (fallbackError) {
        console.error('Error in fallback country fetch:', fallbackError);
        return [];
      }
    }
  }

  async getTimezonesByCountry(countryCode: string): Promise<Timezone[]> {
    try {
      const timezones = await this.getTimezones();
      return timezones.filter(tz => 
        (tz.countryCode || '').toUpperCase() === countryCode.toUpperCase()
      );
    } catch (error) {
      console.error('Error fetching timezones by country:', error);
      return [];
    }
  }

  async getTimezoneById(timezoneId: string): Promise<Timezone | null> {
    try {
      const timezones = await this.getTimezones();
      return timezones.find(tz => tz._id === timezoneId) || null;
    } catch (error) {
      console.error('Error fetching timezone by ID:', error);
      return null;
    }
  }

  // Profile endpoints (using harx2-backend API)
  async getProfile(userId: string): Promise<any> {
    try {
      const response = await api.get(`/profiles/${userId}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<any> {
    try {
      const response = await api.put(`/profiles/${userId}`, profileData);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Utility functions
  formatTimezone(timezone: Timezone): string {
    if (!timezone) return '';
    
    const gmtOffset = timezone.gmtOffset || timezone.offset || 0;
    const hours = Math.floor(Math.abs(gmtOffset));
    const minutes = Math.round((Math.abs(gmtOffset) % 1) * 60);
    const sign = gmtOffset >= 0 ? '+' : '-';
    
    const offsetString = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const zoneName = timezone.zoneName || timezone.name || 'Unknown';
    return `${zoneName} (${offsetString})`;
  }

  getTimezoneDisplayInfo(timezone: Timezone) {
    if (!timezone) return null;
    
    const gmtOffset = timezone.gmtOffset || timezone.offset || 0;
    
    return {
      id: timezone._id,
      countryCode: timezone.countryCode || '',
      countryName: timezone.countryName || timezone.name || '',
      zoneName: timezone.zoneName || timezone.name || '',
      displayName: this.formatTimezone(timezone),
      gmtOffset: gmtOffset,
      offsetHours: gmtOffset
    };
  }
}

export const repWizardApi = new RepWizardApiService();


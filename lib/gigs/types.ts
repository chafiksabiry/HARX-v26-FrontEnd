import { GigData } from '../../types/gigs';

export interface GigDataOld {
  title: string;
  description: string;
  category: string;
  industries?: string[];
  destination_zone: string;
  destinationZones?: string[];
  seniority: {
    level: string;
    yearsExperience: number;
    aiGenerated?: boolean;
  };
  requirements?: string[];
  benefits?: string[];
  highlights?: string[];
  callTypes?: string[];
}


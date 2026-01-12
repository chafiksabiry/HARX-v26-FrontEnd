import { Types } from 'mongoose';

interface MatchingWeights {
  experience: number;
  skills: number;
  industry: number;
  languages: number;
  availability: number;
  timezone: number;
  activities: number;
  region: number;
}

export class MatchingEngine {
  static calculateScore(agent: any, gig: any, weights: MatchingWeights): any {
    const scores = {
      skills: this.calculateSkillsScore(agent, gig),
      languages: this.calculateLanguagesScore(agent, gig),
      industry: this.calculateIndustryScore(agent, gig),
      experience: this.calculateExperienceScore(agent, gig),
      availability: this.calculateAvailabilityScore(agent, gig),
      timezone: this.calculateTimezoneScore(agent, gig),
      activities: this.calculateActivitiesScore(agent, gig),
      region: this.calculateRegionScore(agent, gig),
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    
    let weightedScore = 0;
    if (totalWeight > 0) {
      weightedScore = (
        scores.skills * weights.skills +
        scores.languages * weights.languages +
        scores.industry * weights.industry +
        scores.experience * weights.experience +
        scores.availability * weights.availability +
        scores.timezone * weights.timezone +
        scores.activities * weights.activities +
        scores.region * weights.region
      ) / totalWeight;
    }

    return {
      totalMatchingScore: Math.round(weightedScore),
      details: scores
    };
  }

  private static calculateSkillsScore(agent: any, gig: any): number {
    let totalScore = 0;
    let count = 0;

    const checkSkills = (gigSkills: any[], agentSkills: any[]) => {
      if (!gigSkills || gigSkills.length === 0) return;
      
      gigSkills.forEach(gSkill => {
        count++;
        // Handle populated or ID references
        const gSkillId = gSkill.skill?._id?.toString() || gSkill.skill?.toString();
        
        const match = agentSkills?.find((aSkill: any) => {
           const aSkillId = aSkill.skill?._id?.toString() || aSkill.skill?.toString();
           return aSkillId === gSkillId;
        });

        if (match) {
          // If levels match or agent is higher, 100%. Else proportional.
          const gLevel = gSkill.level || 1;
          const aLevel = match.level || 1;
          if (aLevel >= gLevel) {
            totalScore += 100;
          } else {
            totalScore += (aLevel / gLevel) * 100;
          }
        }
      });
    };

    checkSkills(gig.skills?.professional, agent.skills?.professional);
    checkSkills(gig.skills?.technical, agent.skills?.technical);
    checkSkills(gig.skills?.soft, agent.skills?.soft);

    return count === 0 ? 100 : Math.round(totalScore / count);
  }

  private static calculateLanguagesScore(agent: any, gig: any): number {
    if (!gig.skills?.languages || gig.skills.languages.length === 0) return 100;

    let totalScore = 0;
    gig.skills.languages.forEach((gLang: any) => {
      const gLangId = gLang.language?._id?.toString() || gLang.language?.toString();
      
      const match = agent.personalInfo?.languages?.find((aLang: any) => {
         const aLangId = aLang.language?._id?.toString() || aLang.language?.toString();
         return aLangId === gLangId;
      });

      if (match) {
        // Simple proficiency check: Native/Fluent > Professional > Basic
        const levels = ['basic', 'professional', 'fluent', 'native'];
        const gLevelIdx = levels.indexOf(gLang.proficiency?.toLowerCase() || 'basic');
        const aLevelIdx = levels.indexOf(match.proficiency?.toLowerCase() || 'basic');

        if (aLevelIdx >= gLevelIdx) {
          totalScore += 100;
        } else {
          totalScore += 50; // Partial match
        }
      }
    });

    return Math.round(totalScore / gig.skills.languages.length);
  }

  private static calculateIndustryScore(agent: any, gig: any): number {
    if (!gig.industries || gig.industries.length === 0) return 100;
    
    const agentIndustries = agent.professionalSummary?.industries || [];
    let matches = 0;

    gig.industries.forEach((gInd: any) => {
      const gIndId = gInd._id?.toString() || gInd.toString();
      if (agentIndustries.some((aInd: any) => (aInd._id?.toString() || aInd.toString()) === gIndId)) {
        matches++;
      }
    });

    return Math.round((matches / gig.industries.length) * 100);
  }

  private static calculateExperienceScore(agent: any, gig: any): number {
    // Parse experience strings "1-3 years" -> 2
    // Simplified: Check if agent experience matches requirement
    // Assuming agent.experience is array of roles, can sum years or use yearsOfExperience field
    // In Rep types, professionalSummary.yearsOfExperience is a string.
    
    return 80; // Placeholder: Need rigorous parsing of experience string
  }

  private static calculateAvailabilityScore(agent: any, gig: any): number {
    // Check overlapping hours
    return 85; // Placeholder
  }

  private static calculateTimezoneScore(agent: any, gig: any): number {
    if (!gig.availability?.time_zone || !agent.availability?.timeZone) return 50;
    
    // Compare timezones or calculate offset difference
    // For now, if same ID, 100
    const gTz = gig.availability.time_zone._id?.toString() || gig.availability.time_zone.toString();
    const aTz = agent.availability.timeZone._id?.toString() || agent.availability.timeZone.toString();

    return gTz === aTz ? 100 : 50;
  }

  private static calculateActivitiesScore(agent: any, gig: any): number {
      if (!gig.activities || gig.activities.length === 0) return 100;
      
      const agentActivities = agent.professionalSummary?.activities || [];
      let matches = 0;
  
      gig.activities.forEach((gAct: any) => {
        const gActId = gAct._id?.toString() || gAct.toString();
        if (agentActivities.some((aAct: any) => (aAct._id?.toString() || aAct.toString()) === gActId)) {
          matches++;
        }
      });
  
      return Math.round((matches / gig.activities.length) * 100);
  }

  private static calculateRegionScore(agent: any, gig: any): number {
     // Country check
     if (!gig.destination_zone) return 100;
     
     const gCountry = gig.destination_zone._id?.toString() || gig.destination_zone.toString();
     const aCountry = agent.personalInfo?.country?._id?.toString() || agent.personalInfo?.country?.toString();

     return gCountry === aCountry ? 100 : 0;
  }
}



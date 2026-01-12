"use client";

import React from 'react';
import { GigCreator } from '@/components/Gigs/wizard/GigCreator';
import { 
  Briefcase, 
  Globe2, 
  DollarSign, 
  Brain, 
  Users 
} from 'lucide-react';
import BasicSection from '@/components/Gigs/wizard/sections/BasicSection';
import { ScheduleSection } from '@/components/Gigs/wizard/sections/ScheduleSection';
import { CommissionSection } from '@/components/Gigs/wizard/sections/CommissionSection';
import { SkillsSection } from '@/components/Gigs/wizard/sections/SkillsSection';
import { TeamStructure } from '@/components/Gigs/wizard/sections/TeamStructure';

export default function CreateGigPage() {
  return (
    <GigCreator>
      {({ 
        data, 
        onChange, 
        errors, 
        onPrevious, 
        onNext, 
        onSave, 
        onAIAssist, 
        onReview, 
        currentSection 
      }) => {
        switch (currentSection) {
          case 'basic':
            return (
              <BasicSection
                data={data}
                onChange={onChange}
                errors={errors}
                onNext={onNext}
                onAIAssist={onAIAssist}
                currentSection={currentSection}
              />
            );
          case 'schedule':
            return (
              <ScheduleSection
                data={data.schedule}
                onChange={(scheduleData) => onChange({ 
                  ...data, 
                  schedule: {
                    ...scheduleData,
                    // Ensure timeZones is always present if required by GigData
                    timeZones: scheduleData.timeZones || [] 
                  } 
                })}
                onPrevious={onPrevious}
                onNext={onNext}
              />
            );
          case 'commission':
            return (
              <CommissionSection
                data={data}
                onChange={onChange}
                errors={errors}
                warnings={{}}
                onPrevious={onPrevious}
                onNext={onNext}
              />
            );
          case 'skills':
            // Safely handle potentially missing certifications property
            const skillsData = data.skills as any;
            const certifications = skillsData.certifications || [];
            
            return (
              <SkillsSection
                data={{
                  ...data.skills,
                  certifications
                }}
                onChange={(skillsData) => onChange({ ...data, skills: skillsData })}
                errors={errors}
                onPrevious={onPrevious}
                onNext={onNext}
              />
            );
          case 'team':
            return (
              <TeamStructure
                data={data}
                onChange={onChange}
                errors={{ team: errors.team as any }}
                onPrevious={onPrevious}
                onNext={onReview}
                currentSection={currentSection}
              />
            );
          default:
            return null;
        }
      }}
    </GigCreator>
  );
}


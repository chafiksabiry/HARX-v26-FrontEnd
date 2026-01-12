import React from "react";
import { GigData } from "../../types/gigs";
import { SectionGuidance } from "./SectionGuidance";
import BasicSection from "./BasicSection";
import { ScheduleSection } from "./ScheduleSection";
import { CommissionSection } from "./CommissionSection";
import { SkillsSection } from "./SkillsSection";
import { TeamStructure } from "./TeamStructure";
import { GigReview as ReviewPage } from "./GigReview";
import { saveGigData, updateGigData } from '../../lib/gigs/api';

interface SectionContentProps {
  section: string;
  data: GigData;
  onChange: (data: GigData) => void;
  errors: { [key: string]: string[] };
  constants: any;
  onSectionChange?: (section: string) => void;
  isAIMode?: boolean;
  isEditMode?: boolean;
  editGigId?: string | null;
}

export function SectionContent({
  section,
  data,
  onChange,
  errors,
  onSectionChange,
  isAIMode = false,
  isEditMode = false,
  editGigId = null,
}: SectionContentProps) {

  // Ensure seniority object is properly initialized
  const initializedData = React.useMemo(() => {
    return {
      ...data,
      seniority: {
        level: data.seniority?.level || '',
        yearsExperience: data.seniority?.yearsExperience || 0,
      },
      skills: {
        professional: data.skills?.professional || [],
        technical: data.skills?.technical || [],
        soft: data.skills?.soft || [],
        languages: data.skills?.languages || [],
      }
    };
  }, [data]);

  const renderContent = () => {
    const effectiveSection = section as 'basic' | 'schedule' | 'commission' | 'skills' | 'team' | 'leads' | 'review';
    switch (effectiveSection) {
      case "basic":
        return (
          <BasicSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => {
              onSectionChange?.('suggestions');
            }}
            onNext={() => onSectionChange?.('schedule')}
            onSave={() => {}}
            onAIAssist={() => {}}
            currentSection={section}
          />
        );

      case "schedule":
        return (
          <ScheduleSection
            data={{...initializedData.schedule}}
            destination_zone={data.destination_zone}
            onChange={(scheduleData) => onChange({
              ...data,
              schedule: {
                schedules: scheduleData.schedules,
                time_zone: scheduleData.time_zone || "",
                timeZones: scheduleData.time_zone ? [scheduleData.time_zone] : [],
                flexibility: scheduleData.flexibility,
                minimumHours: scheduleData.minimumHours,
              },
              availability: {
                ...data.availability,
                schedule: scheduleData.schedules,
                time_zone: scheduleData.time_zone || "",
                flexibility: scheduleData.flexibility,
                minimumHours: scheduleData.minimumHours,
              }
            })}
            onPrevious={() => onSectionChange?.('basic')}
            onNext={() => onSectionChange?.('commission')}
          />
        );

      case "commission":
        return (
          <CommissionSection
            data={initializedData}
            onChange={onChange}
            errors={errors}
            warnings={{}}
            onPrevious={() => onSectionChange?.('schedule')}
            onNext={() => onSectionChange?.('skills')}
          />
        );

      case "skills":
        return (
          <SkillsSection
            data={{
              languages: initializedData.skills.languages,
              soft: initializedData.skills.soft,
              professional: initializedData.skills.professional,
              technical: initializedData.skills.technical,
              certifications: []
            }}
            onChange={(skillsData) => onChange({
              ...initializedData,
              skills: {
                ...initializedData.skills,
                languages: skillsData.languages || initializedData.skills.languages,
                soft: skillsData.soft || initializedData.skills.soft,
                professional: skillsData.professional || initializedData.skills.professional,
                technical: skillsData.technical || initializedData.skills.technical
              }
            })}
            errors={errors}
            onPrevious={() => onSectionChange?.('leads')} // Assuming leads is skipped for now, but referenced in switch
            onNext={() => onSectionChange?.('team')}
          />
        );

      case "team":
        return (
          <TeamStructure
            data={initializedData}
            onChange={onChange}
            errors={errors}
            onPrevious={() => onSectionChange?.('skills')}
            onNext={() => onSectionChange?.('review')}
            currentSection={section as any}
          />
        );

      case "review":
        return (
          <ReviewPage
            data={initializedData}
            onEdit={(section) => {
              onSectionChange?.(section);
            }}
            isSubmitting={false}
            onBack={() => {
              onSectionChange?.('team');
            }}
            skipValidation={false}
            onSubmit={async () => {
              try {
                // Save or update gig data to API based on mode
                const result = isEditMode && editGigId 
                  ? await updateGigData(editGigId, initializedData)
                  : await saveGigData(initializedData);
                
                if (result.error) {
                  console.error('Error saving/updating gig:', result.error);
                  return;
                }
              } catch (error) {
                console.error('Error in gig submission:', error);
              }
            }}
            isEditMode={isEditMode}
            editGigId={editGigId}
          />
        );

      default:
        return null;
    }
  };
  return (
    <div className="bg-white border border-gray-100/50 p-8">
      <SectionGuidance section={section} />
      {renderContent()}
    </div>
  );
}




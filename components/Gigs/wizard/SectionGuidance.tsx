// harx/components/Gigs/wizard/SectionGuidance.tsx
import React from 'react';
import { InfoText } from './InfoText';

interface SectionGuidanceProps {
  section: string;
}

export const SectionGuidance: React.FC<SectionGuidanceProps> = ({ section }) => {
  const getGuidance = () => {
    switch (section) {
      case 'basic':
        return "Start by providing the basic information about the contact center role. Be specific and clear about the position's requirements and responsibilities.";
      case 'schedule':
        return "Define the working hours and availability requirements. You can add multiple schedule groups and specify flexibility options.";
      case 'commission':
        return "Outline the commission structure clearly. Include base rates, bonuses, and any minimum volume requirements.";
      case 'skills':
        return "Select the required skills and proficiency levels. Be sure to include both technical and soft skills relevant to the role.";
      case 'team':
        return "Define the team structure, including roles, seniority levels, and reporting lines.";
      case 'leads':
        return "Specify the types of leads provided and their sources. This helps agents understand the quality and origin of leads.";
      default:
        return "";
    }
  };

  const guidance = getGuidance();

  if (!guidance) return null;

  return (
    <div className="mb-6">
      <InfoText>{guidance}</InfoText>
    </div>
  );
};

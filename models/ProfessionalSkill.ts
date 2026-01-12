import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfessionalSkill extends Document {
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const professionalSkillSchema = new Schema<IProfessionalSkill>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Product Knowledge', 
      'Communication Channels', 
      'CRM & Ticketing', 
      'Call Center Operations', 
      'Documentation', 
      'Compliance & QA', 
      'Performance Metrics', 
      'Language & Culture', 
      'Reporting & Analysis'
    ],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const ProfessionalSkill: Model<IProfessionalSkill> = mongoose.models.ProfessionalSkill || mongoose.model<IProfessionalSkill>('ProfessionalSkill', professionalSkillSchema);

export default ProfessionalSkill;


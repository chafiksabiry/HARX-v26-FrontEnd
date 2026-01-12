import mongoose, { Document } from 'mongoose';

export interface IIndustry extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IndustrySchema = new mongoose.Schema<IIndustry>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Industry || mongoose.model<IIndustry>('Industry', IndustrySchema);




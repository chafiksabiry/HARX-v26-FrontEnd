import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  targetUserType: 'company' | 'representative';
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  targetUserType: {
    type: String,
    required: true,
    enum: ['company', 'representative'],
    lowercase: true
  }
}, {
  timestamps: true
});

const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', planSchema);

export default Plan;


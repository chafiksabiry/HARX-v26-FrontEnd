import mongoose, { Document } from 'mongoose';

export interface IActivity extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new mongoose.Schema<IActivity>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);




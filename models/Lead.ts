import mongoose, { Document } from 'mongoose';

export interface ILead extends Document {
  userId: mongoose.Types.ObjectId;
  gigId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  notes: string;
  assignedTo: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: String,
  email: String,
  phone: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  source: String,
  notes: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);

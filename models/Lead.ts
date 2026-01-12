import mongoose from 'mongoose';

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

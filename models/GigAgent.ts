import mongoose from 'mongoose';

const GigAgentSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  status: {
    type: String,
    enum: ['invited', 'applied', 'interviewing', 'hired', 'rejected', 'enrolled', 'active'],
    default: 'invited',
  },
  matchDetails: {
    type: Object, // Store snapshot of match score/details
  },
  notes: String,
}, { timestamps: true });

// Prevent duplicate entries for same gig-agent pair
GigAgentSchema.index({ gigId: 1, agentId: 1 }, { unique: true });

export default mongoose.models.GigAgent || mongoose.model('GigAgent', GigAgentSchema);



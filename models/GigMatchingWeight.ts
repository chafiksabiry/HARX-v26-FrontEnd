import mongoose from 'mongoose';

const GigMatchingWeightSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
    unique: true,
  },
  matchingWeights: {
    type: Object, // Flexible structure for weights
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.GigMatchingWeight || mongoose.model('GigMatchingWeight', GigMatchingWeightSchema);



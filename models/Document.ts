import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  fileUrl: String,
  cloudinaryPublicId: String,
  fileType: String,
  content: String,
  tags: [String],
  uploadedBy: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  chunks: [{
    content: String,
    index: Number
  }],
  metadata: {
    wordCount: Number,
    characterCount: Number,
    createdAt: Date,
    modifiedAt: Date
  },
  isProcessed: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Document || mongoose.model('Document', documentSchema);


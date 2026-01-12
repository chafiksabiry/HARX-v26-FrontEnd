import mongoose from 'mongoose';

const SectorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Sector || mongoose.model('Sector', SectorSchema);




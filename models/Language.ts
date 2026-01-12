import mongoose, { Document } from 'mongoose';

export interface ILanguage extends Document {
  name: string;
  iso639_1: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LanguageSchema = new mongoose.Schema<ILanguage>(
  {
    name: { type: String, required: true, unique: true },
    iso639_1: { type: String, required: true, unique: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Language || mongoose.model<ILanguage>('Language', LanguageSchema);




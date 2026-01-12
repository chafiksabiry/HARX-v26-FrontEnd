import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'currencies'
  }
);

currencySchema.index({ name: 1 });
currencySchema.index({ isActive: 1 });

export default mongoose.models.Currency || mongoose.model('Currency', currencySchema);




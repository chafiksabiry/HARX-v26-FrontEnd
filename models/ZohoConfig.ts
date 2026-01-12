import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { ICompany } from './Company';

export interface IZohoConfig extends Document {
  userId: Types.ObjectId | IUser;
  companyId: Types.ObjectId | ICompany;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  expiresIn?: number;
  lastUpdated: Date;
}

const zohoConfigSchema = new Schema<IZohoConfig>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: false
  },
  expiresIn: {
    type: Number,
    required: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ZohoConfig: Model<IZohoConfig> = mongoose.models.ZohoConfig || mongoose.model<IZohoConfig>('ZohoConfig', zohoConfigSchema);

export default ZohoConfig;


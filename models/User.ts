import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.linkedInId;
    }
  },
  phone: {
    type: String,
    required: function(this: any) {
      return !this.linkedInId;
    }
  },
  linkedInId: {
    type: String,
    sparse: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    code: String,
    expiresAt: Date,
    otp: { type: Number },
    otpExpiresAt: { type: Date },
  },
  ipHistory: [{
    ip: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['register', 'login']
    },
    locationInfo: {
      location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timezone',
        required: false
      },
      region: String,
      city: String,
      isp: String,
      postal: String,
      coordinates: String // format: "lat,lng"
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  typeUser: {
    type: String,
    default: null,
  },
  firstTime: {
    type: Boolean,
    default: true
  }
});

// Modern async/await approach for password hashing
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Always delete cached model to force fresh compilation
if (mongoose.models.User) {
  delete mongoose.models.User;
}
if (mongoose.connection.models.User) {
  delete mongoose.connection.models.User;
}

const User = mongoose.model('User', userSchema);
export default User;

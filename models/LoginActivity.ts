import mongoose from 'mongoose';

export interface ILoginActivity {
  userId?: string;
  userName?: string;
  email: string;
  role: string;
  status: 'success' | 'failed';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  loginAt: Date;
  logoutAt?: Date;
  duration?: number; // in seconds
  location?: string;
}

const loginActivitySchema = new mongoose.Schema<ILoginActivity>(
  {
    userId: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    os: {
      type: String,
    },
    browser: {
      type: String,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
loginActivitySchema.index({ loginAt: -1 });
loginActivitySchema.index({ email: 1, status: 1 });
loginActivitySchema.index({ userId: 1, loginAt: -1 });

export default mongoose.models.LoginActivity || mongoose.model<ILoginActivity>('LoginActivity', loginActivitySchema);

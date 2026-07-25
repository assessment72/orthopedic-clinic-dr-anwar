import mongoose from 'mongoose';

const ACTION_ENUM = [
  'login_success',
  'login_failed',
  'create_patient',
  'update_patient',
  'delete_patient',
  'create_appointment',
  'update_appointment',
  'delete_appointment',
  'cancel_appointment',
  'create_invoice',
  'update_invoice',
  'delete_invoice',
  'pay_invoice',
  'void_invoice',
] as const;

const TARGET_TYPE_ENUM = [
  'patient',
  'appointment',
  'invoice',
  'user',
  'settings',
  'other',
] as const;

const STATUS_ENUM = ['success', 'failed'] as const;

export interface IActivityLog {
  user?: mongoose.Types.ObjectId;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: (typeof ACTION_ENUM)[number]
  target?: string;
  targetType?: (typeof TARGET_TYPE_ENUM)[number];
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  status: (typeof STATUS_ENUM)[number];
  error?: string;
  timestamp: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: {
      type: String,
    },
    userName: {
      type: String,
    },
    userRole: {
      type: String,
    },
    action: {
      type: String,
      enum: ACTION_ENUM,
      required: true,
    },
    target: {
      type: String,
    },
    targetType: {
      type: String,
      enum: TARGET_TYPE_ENUM,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      required: true,
    },
    error: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ userEmail: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ userRole: 1, timestamp: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

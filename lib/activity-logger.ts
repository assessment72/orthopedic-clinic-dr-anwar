import dbConnect from './mongodb';
import ActivityLog from '../models/ActivityLog';
import { UAParser } from 'ua-parser-js';
import type { Session } from 'next-auth';

export type ActivityAction =
  | 'login_success'
  | 'login_failed'
  | 'create_patient'
  | 'update_patient'
  | 'delete_patient'
  | 'create_appointment'
  | 'update_appointment'
  | 'delete_appointment'
  | 'cancel_appointment'
  | 'create_invoice'
  | 'update_invoice'
  | 'delete_invoice'
  | 'pay_invoice'
  | 'void_invoice';

export type TargetType =
  | 'patient'
  | 'appointment'
  | 'invoice'
  | 'user'
  | 'settings'
  | 'other';

export type ActivityStatus = 'success' | 'failed';

interface LogActivityParams {
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: ActivityAction;
  target?: string;
  targetType?: TargetType;
  details?: Record<string, any>;
  status: ActivityStatus;
  error?: string;
  req?: Request | any;
}

/**
 * Extract IP address from request headers
 */
function extractIP(req: Request | any): string {
  try {
    const headers = req.headers;
    if (headers instanceof Headers) {
      const forwarded = headers.get('x-forwarded-for');
      if (forwarded) return forwarded.split(',')[0].trim();
      return headers.get('x-real-ip') || '';
    } else if (headers) {
      const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'];
      if (forwarded) return forwarded.split(',')[0].trim();
      return '';
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Extract User-Agent from request headers
 */
function extractUserAgent(req: Request | any): string {
  try {
    const headers = req.headers;
    if (headers instanceof Headers) {
      return headers.get('user-agent') || '';
    } else if (headers) {
      return headers['user-agent'] || '';
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Log an activity to the database. This function is designed to be fire-and-forget
 * — it catches all errors internally so it never affects the calling operation.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await dbConnect();

    const ip = params.req ? extractIP(params.req) : '';
    const userAgent = params.req ? extractUserAgent(params.req) : '';

    await ActivityLog.create({
      user: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      action: params.action,
      target: params.target,
      targetType: params.targetType,
      details: params.details,
      ip,
      userAgent,
      status: params.status,
      error: params.error,
      timestamp: new Date(),
    });
  } catch (error) {
    // Silently fail — activity logging should never block the main operation
    console.error('[ActivityLogger] Failed to log activity:', error);
  }
}

/**
 * Helper: log activity from a session object (used in API routes)
 */
export function logFromSession(
  session: Session | null,
  action: ActivityAction,
  target: string,
  targetType: TargetType,
  details: Record<string, any>,
  status: ActivityStatus,
  error?: string,
  req?: Request | any
): Promise<void> {
  return logActivity({
    userId: session?.user?.id,
    userEmail: session?.user?.email ?? undefined,
    userName: session?.user?.name ?? undefined,
    action,
    target,
    targetType,
    details,
    status,
    error,
    req,
  });
}

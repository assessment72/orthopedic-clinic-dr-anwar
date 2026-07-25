import dbConnect from './mongodb';
import LoginActivity from '../models/LoginActivity';
import { UAParser } from 'ua-parser-js';

export async function logLoginActivity(params: {
  email: string;
  role: string;
  status: 'success' | 'failed';
  userId?: string;
  userName?: string;
  reason?: string;
  req?: Request | any;
}) {
  try {
    await dbConnect();

    let ipAddress = '';
    let userAgent = '';
    let browser = '';
    let os = '';
    let deviceType = 'desktop';

    if (params.req) {
      // Handle different request types (standard Request or Next.js internal req)
      const headers = params.req.headers;
      if (headers instanceof Headers) {
        ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || '';
        userAgent = headers.get('user-agent') || '';
      } else if (headers) {
        // Standard Node.js request headers
        ipAddress = headers['x-forwarded-for'] || headers['x-real-ip'] || '';
        userAgent = headers['user-agent'] || '';
      }
    }

    // Parse user agent
    if (userAgent) {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      browser = result.browser.name || 'Unknown';
      os = result.os.name || 'Unknown';
      deviceType = result.device.type || 'desktop';
    }

    const activity = new LoginActivity({
      userId: params.userId,
      userName: params.userName,
      email: params.email,
      role: params.role,
      status: params.status,
      reason: params.reason,
      ipAddress: ipAddress.split(',')[0].trim(), // Take first IP in chain
      userAgent,
      deviceType,
      os,
      browser,
      loginAt: new Date(),
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Failed to log login activity:', error);
    // Don't throw - logging should not block authentication
  }
}

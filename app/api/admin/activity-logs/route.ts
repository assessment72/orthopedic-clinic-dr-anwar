import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

function buildQuery(req: NextRequest, session: any) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const action = searchParams.get('action') || '';
  const targetType = searchParams.get('targetType') || '';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const query: any = {};

  // Non-admin users can only see their own activities
  if (session.user.role !== 'admin') {
    query.userEmail = session.user.email;
  }

  if (role && session.user.role === 'admin') {
    query.userRole = role;
  }

  if (search) {
    query.$or = [
      { userEmail: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
      { ip: { $regex: search, $options: 'i' } },
      { target: { $regex: search, $options: 'i' } },
    ];
  }

  if (action) {
    query.action = action;
  }

  if (targetType) {
    query.targetType = targetType;
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return query;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Export mode: return all matching records (no pagination)
    const exportMode = searchParams.get('export') === '1';

    const query = buildQuery(req, session);

    if (exportMode) {
      const activities = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .lean();

      return NextResponse.json({ activities });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('API Error (activity-logs):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

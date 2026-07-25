import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../../lib/mongodb';
import LoginActivity from '../../../../models/LoginActivity';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};

    // If user is not admin, only show their own login activities
    if (session.user.role !== 'admin') {
      query.userId = session.user.id;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (role) {
      query.role = role;
    }

    if (startDate || endDate) {
      query.loginAt = {};
      if (startDate) query.loginAt.$gte = new Date(startDate);
      if (endDate) query.loginAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      LoginActivity.find(query)
        .sort({ loginAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LoginActivity.countDocuments(query),
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
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

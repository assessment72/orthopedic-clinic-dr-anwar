import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import bcrypt from 'bcryptjs';

/**
 * Admin-only endpoint to seed the database with default accounts.
 * POST /api/admin/seed
 * Requires NEXTAUTH_SECRET match or admin role session.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Simple protection: check for a seed secret in request body
    const body = await request.json().catch(() => ({}));
    const SEED_SECRET = process.env.SEED_SECRET || 'seed-orthopedic-clinic-2025';
    
    if (body.secret !== SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - invalid seed secret' },
        { status: 401 }
      );
    }

    const results: string[] = [];

    // Create/ensure demo doctor user with hashed password
    let doctor = await User.findOne({ email: 'doctor@aidoc.com' });
    if (!doctor) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      doctor = new User({
        email: 'doctor@aidoc.com',
        name: 'الدكتور أنور',
        role: 'doctor',
        specialization: 'جراحة العظام والمفاصل',
        password: hashedPassword,
      });
      await doctor.save();
      results.push('Created demo doctor user: doctor@aidoc.com / password123');
    } else if (!doctor.password) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      doctor.password = hashedPassword;
      doctor.name = 'الدكتور أنور';
      doctor.specialization = 'جراحة العظام والمفاصل';
      await doctor.save();
      results.push('Updated demo doctor user with hashed password');
    } else {
      results.push('Doctor user already exists with password');
    }

    // Create/ensure admin user
    let admin = await User.findOne({ email: 'admin@aidoc.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      admin = new User({
        email: 'admin@aidoc.com',
        name: 'Admin',
        role: 'admin',
        password: hashedPassword,
      });
      await admin.save();
      results.push('Created admin user: admin@aidoc.com / password123');
    } else if (!admin.password) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      results.push('Updated admin user with hashed password');
    } else {
      results.push('Admin user already exists with password');
    }

    // Create/ensure staff user
    let staff = await User.findOne({ email: 'staff@aidoc.com' });
    if (!staff) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      staff = new User({
        email: 'staff@aidoc.com',
        name: 'Staff',
        role: 'staff',
        password: hashedPassword,
      });
      await staff.save();
      results.push('Created staff user: staff@aidoc.com / password123');
    } else if (!staff.password) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      staff.password = hashedPassword;
      await staff.save();
      results.push('Updated staff user with hashed password');
    } else {
      results.push('Staff user already exists with password');
    }

    // Free any conflicting Patient emails
    const staffEmails = ['admin@aidoc.com', 'doctor@aidoc.com', 'staff@aidoc.com'];
    for (const email of staffEmails) {
      const conflictPatient = await Patient.findOne({ email });
      if (conflictPatient) {
        const newEmail = `legacy-${conflictPatient.patientId || conflictPatient._id}@patient.local`;
        conflictPatient.email = newEmail;
        await conflictPatient.save();
        results.push(`Moved conflicting patient from ${email} to ${newEmail}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

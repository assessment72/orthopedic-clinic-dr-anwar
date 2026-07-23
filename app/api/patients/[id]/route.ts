import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';

const BLOOD_TYPES = new Set(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
const GENDERS = new Set(['male', 'female', 'other', 'prefer-not-to-say']);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = (await request.json()) as Record<string, unknown>;
    const { id } = await params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (typeof body.name === 'string' && body.name.trim()) {
      patient.name = body.name.trim();
    }
    if (typeof body.email === 'string' && body.email.trim()) {
      patient.email = body.email.trim().toLowerCase();
    }
    if (typeof body.phone === 'string' && body.phone.trim()) {
      patient.phone = body.phone.trim();
    }
    if (body.dateOfBirth) {
      const d = new Date(String(body.dateOfBirth));
      if (!Number.isNaN(d.getTime())) {
        patient.dateOfBirth = d;
      }
    }
    if (typeof body.gender === 'string' && GENDERS.has(body.gender)) {
      patient.gender = body.gender as typeof patient.gender;
    }
    if (typeof body.address === 'string') {
      patient.address = body.address.trim() || undefined;
    }
    if (typeof body.assignedDoctor === 'string') {
      patient.assignedDoctor = body.assignedDoctor.trim() || undefined;
    }

    const bt = typeof body.bloodType === 'string' ? body.bloodType.trim() : '';
    if (bt && BLOOD_TYPES.has(bt)) {
      patient.bloodType = bt as NonNullable<(typeof patient)['bloodType']>;
    } else if (body.bloodType === '' || body.bloodType === null) {
      patient.set('bloodType', undefined);
    }

    if (typeof body.medicalHistory === 'string') {
      patient.medicalHistory = body.medicalHistory
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.medicalHistory)) {
      patient.medicalHistory = body.medicalHistory.map(String).map((s) => s.trim()).filter(Boolean);
    }

    const ec = body.emergencyContact;
    if (ec && typeof ec === 'object' && ec !== null && !Array.isArray(ec)) {
      const o = ec as Record<string, unknown>;
      patient.emergencyContact = {
        name: typeof o.name === 'string' ? o.name.trim() : '',
        relationship: typeof o.relationship === 'string' ? o.relationship.trim() : '',
        phone: typeof o.phone === 'string' ? o.phone.trim() : '',
      };
    }

    // Orthopedic fields
    if (typeof body.orthopedicHistory === 'string') {
      patient.orthopedicHistory = body.orthopedicHistory
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.orthopedicHistory)) {
      patient.orthopedicHistory = body.orthopedicHistory.map(String).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof body.chiefComplaint === 'string') {
      patient.chiefComplaint = body.chiefComplaint.trim() || undefined;
    }
    if (typeof body.injurySite === 'string') {
      patient.injurySite = body.injurySite.trim() || undefined;
    }
    if (typeof body.injuryNotes === 'string') {
      patient.injuryNotes = body.injuryNotes.trim() || undefined;
    }
    if (typeof body.injuryLocations === 'object' && body.injuryLocations !== null && Array.isArray(body.injuryLocations)) {
      patient.injuryLocations = body.injuryLocations.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: typeof item.id === 'string' ? item.id.trim() : '',
            notes: typeof item.notes === 'string' ? item.notes.trim() : undefined,
            diagnosis: typeof item.diagnosis === 'string' ? item.diagnosis.trim() : undefined,
            xray: typeof item.xray === 'string' ? item.xray.trim() : undefined,
          };
        }
        return { id: String(item) };
      }).filter((item: any) => item.id);
    }
    if (typeof body.injuryType === 'string') {
      patient.injuryType = body.injuryType.trim() || undefined;
    }
    if (typeof body.affectedJoint === 'string') {
      patient.affectedJoint = body.affectedJoint.trim() || undefined;
    }
    if (body.painLevel !== undefined && body.painLevel !== null) {
      const pl = Number(body.painLevel);
      if (!Number.isNaN(pl) && pl >= 0 && pl <= 10) {
        patient.painLevel = pl;
      }
    }
    if (typeof body.splintOrCast === 'string') {
      patient.splintOrCast = body.splintOrCast.trim() || undefined;
    }
    if (typeof body.surgicalOperations === 'string') {
      patient.surgicalOperations = body.surgicalOperations
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.surgicalOperations)) {
      patient.surgicalOperations = body.surgicalOperations.map(String).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof body.physicalTherapy === 'string') {
      patient.physicalTherapy = body.physicalTherapy.trim() || undefined;
    }
    if (typeof body.diagnosis === 'string') {
      patient.diagnosis = body.diagnosis
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.diagnosis)) {
      patient.diagnosis = body.diagnosis.map(String).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof body.treatmentPlan === 'string') {
      patient.treatmentPlan = body.treatmentPlan
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.treatmentPlan)) {
      patient.treatmentPlan = body.treatmentPlan.map(String).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof body.imagingStudies === 'object' && body.imagingStudies !== null && Array.isArray(body.imagingStudies)) {
      patient.imagingStudies = body.imagingStudies;
    }
    if (typeof body.followUpAppointments === 'string') {
      // Parse string as JSON or treat as a single date string
      try {
        const parsed = JSON.parse(body.followUpAppointments);
        if (Array.isArray(parsed)) {
          patient.followUpAppointments = parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              return {
                date: item.date ? new Date(item.date) : new Date(),
                notes: typeof item.notes === 'string' ? item.notes.trim() : undefined,
              };
            }
            return { date: new Date(item), notes: undefined };
          }).filter((item: any) => !Number.isNaN(item.date.getTime()));
        }
      } catch {
        // If it's not valid JSON, treat as a single date
        const d = new Date(body.followUpAppointments);
        if (!Number.isNaN(d.getTime())) {
          patient.followUpAppointments = [{ date: d, notes: undefined }];
        }
      }
    } else if (Array.isArray(body.followUpAppointments)) {
      patient.followUpAppointments = body.followUpAppointments.map((item: any) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return {
            date: item.date ? new Date(String(item.date)) : new Date(),
            notes: typeof item.notes === 'string' ? item.notes.trim() : undefined,
          };
        }
        const d = new Date(String(item));
        return { date: d, notes: undefined };
      }).filter((item: any) => !Number.isNaN(item.date.getTime()));
    }
    if (body.followUpDate) {
      const d = new Date(String(body.followUpDate));
      if (!Number.isNaN(d.getTime())) {
        // Add or update the followUpAppointments array
        const existing = Array.isArray(patient.followUpAppointments) ? patient.followUpAppointments : [];
        const newEntry = { date: d, notes: undefined };
        if (!existing.some((e: any) => new Date(e.date).getTime() === d.getTime())) {
          existing.push(newEntry);
        }
        patient.followUpAppointments = existing;
      }
    }

    await patient.save();

    return NextResponse.json(patient);
  } catch (error: unknown) {
    console.error('Error updating patient:', error);
    const err = error as { name?: string; code?: number; errors?: Record<string, { message: string }>; message?: string };
    if (err.name === 'ValidationError' && err.errors) {
      const details = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
    }
    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate entry', details: 'Another patient already uses this email.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update patient', details: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const patient = await Patient.findByIdAndDelete(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}

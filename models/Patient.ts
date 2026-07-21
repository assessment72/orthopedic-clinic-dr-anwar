import mongoose from 'mongoose';

export interface IPatient {
  _id: string;
  patientId: string;
  name: string;
  email?: string; // جعل البريد الإلكتروني اختياريًا
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[]; // تاريخ طبي عام
  allergies: string[];
  currentMedications: string[];
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  insuranceProvider?: string;
  insuranceNumber?: string;
  assignedDoctor?: string; // الطبيب المعالج
  // إضافة حقول خاصة بعيادة العظام
  orthopedicHistory?: string[]; // تاريخ طبي خاص بالعظام (كسور سابقة، عمليات، أمراض مزمنة بالعظام)
  chiefComplaint?: string; // الشكوى الرئيسية الحالية للمريض (سبب الزيارة)
  injurySite?: string; // موضع الإصابة
  injuryType?: string; // نوع الكسر أو الإصابة
  affectedJoint?: string; // المفصل المصاب
  painLevel?: number; // مستوى الألم (0-10)
  splintOrCast?: string; // الجبيرة أو الجبس
  surgicalOperations?: string[]; // العمليات الجراحية
  physicalTherapy?: string; // العلاج الطبيعي
  diagnosis?: string[]; // التشخيصات المتعلقة بحالة العظام
  treatmentPlan?: string[]; // خطة العلاج المقترحة (جراحة، علاج طبيعي، أدوية، جبائر)
  imagingStudies?: Array<{ // فحوصات التصوير (أشعة سينية، رنين مغناطيسي، مقطعية)
    type: string; // نوع الفحص (مثلاً: X-ray, MRI, CT Scan)
    date: Date;
    resultsSummary?: string; // ملخص النتائج
    imageUrl?: string; // رابط للصورة أو التقرير إذا كان مخزنًا خارجيًا
  }>;
  followUpAppointments?: Array<{ // مواعيد المتابعة
    date: Date;
    notes?: string;
  }>;
  referredBy?: string; // الجهة التي أحالت المريض (مثلاً: طبيب آخر، مستشفى)
  password?: string; // For patient login
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new mongoose.Schema<IPatient>(
  {
    patientId: {
      type: String,
      unique: true,
      required: false, // سيتم إنشاؤه تلقائيًا في خطاف ما قبل الحفظ إذا لم يتم توفيره
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // جعل البريد الإلكتروني اختياريًا
      unique: true,
      sparse: true, // يسمح بقيم فارغة مع الحفاظ على التفرد للقيم غير الفارغة
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: false,
        trim: true,
      },
      phone: {
        type: String,
        required: false,
        trim: true,
      },
      relationship: {
        type: String,
        required: false,
        trim: true,
      },
    },
    medicalHistory: [{
      type: String,
      trim: true,
    }],
    allergies: [{
      type: String,
      trim: true,
    }],
    currentMedications: [{
      type: String,
      trim: true,
    }],
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    insuranceProvider: {
      type: String,
      trim: true,
    },
    insuranceNumber: {
      type: String,
      trim: true,
    },
    assignedDoctor: {
      type: String,
      trim: true,
    },
    // إضافة حقول خاصة بعيادة العظام
    orthopedicHistory: [{
      type: String,
      trim: true,
    }],
    chiefComplaint: {
      type: String,
      required: false,
      trim: true,
    },
    injurySite: {
      type: String,
      trim: true,
    },
    injuryType: {
      type: String,
      trim: true,
    },
    affectedJoint: {
      type: String,
      trim: true,
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    splintOrCast: {
      type: String,
      trim: true,
    },
    surgicalOperations: [{
      type: String,
      trim: true,
    }],
    physicalTherapy: {
      type: String,
      trim: true,
    },
    diagnosis: [{
      type: String,
      trim: true,
    }],
    treatmentPlan: [{
      type: String,
      trim: true,
    }],
    imagingStudies: [{
      type: new mongoose.Schema({
        type: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        resultsSummary: { type: String, trim: true },
        imageUrl: { type: String, trim: true },
      }),
    }],
    followUpAppointments: [{
      type: new mongoose.Schema({
        date: { type: Date, required: true },
        notes: { type: String, trim: true },
      }),
    }],
    referredBy: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate patient ID (fallback if not set in API)
patientSchema.pre('save', function() {
  // Only generate if patientId is not already set
  if (!this.patientId) {
    // Use timestamp-based ID as fallback
      this.patientId = `PAT-${Date.now().toString().slice(-6)}`;
  }
});

// Prevent multiple model initialization in development
export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);

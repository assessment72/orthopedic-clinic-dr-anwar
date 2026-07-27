'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Save,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';
import SkeletonMap from '../../components/SkeletonMap';

interface SelectedRegion {
  id: string;
  notes?: string;
  diagnosis?: string;
  xray?: string;
}

export default function NewPatientPage() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'ar';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    familyHistory: '',
    orthopedicHistory: '',
    chiefComplaint: '',
    injurySite: '',
    injuryNotes: '',
    injuryType: '',
    affectedJoint: '',
    painLevel: '',
    splintOrCast: '',
    surgicalOperations: '',
    physicalTherapy: '',
    diagnosis: '',
    treatmentPlan: '',
    imaging: '',
    followUpDate: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: ''
  });

  const [selectedRegions, setSelectedRegions] = useState<SelectedRegion[]>([]);
  const [activeSection, setActiveSection] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات لتتبع التعديل اليدوي للبريد وكلمة المرور
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);
  const [isPasswordManuallyEdited, setIsPasswordManuallyEdited] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // معالجة حقل رقم الجوال
      if (name === 'phone') {
        if (!isEmailManuallyEdited) {
          const newEmail = `${value}@gmail.com`;
          newData.email = newEmail;
          if (!isPasswordManuallyEdited) {
            newData.password = newEmail;
          }
        } else {
          // إذا كان البريد معدلاً يدوياً، نحدّث كلمة المرور فقط إذا لم تُعدّل يدوياً
          if (!isPasswordManuallyEdited) {
            newData.password = newData.email;
          }
        }
      }

      // معالجة حقل البريد الإلكتروني
      if (name === 'email') {
        setIsEmailManuallyEdited(true);
        if (!isPasswordManuallyEdited) {
          newData.password = value;
        }
      }

      // معالجة حقل كلمة المرور
      if (name === 'password') {
        setIsPasswordManuallyEdited(true);
      }

      return newData;
    });
  };

  // دوال خريطة الهيكل العظمي (نفسها)
  const getRegionName = (id: string) => {
    const names: Record<string, Record<'ar' | 'en', string>> = {
      skull: { ar: 'الجمجمة', en: 'Skull' },
      jaw: { ar: 'الفك', en: 'Jaw' },
      neck: { ar: 'الرقبة', en: 'Neck' },
      shoulderRight: { ar: 'الكتف الأيمن', en: 'Right Shoulder' },
      shoulderLeft: { ar: 'الكتف الأيسر', en: 'Left Shoulder' },
      armRight: { ar: 'العضد الأيمن', en: 'Right Arm' },
      armLeft: { ar: 'العضد الأيسر', en: 'Left Arm' },
      elbowRight: { ar: 'المرفق الأيمن', en: 'Right Elbow' },
      elbowLeft: { ar: 'المرفق الأيسر', en: 'Left Elbow' },
      forearmRight: { ar: 'الساعد الأيمن', en: 'Right Forearm' },
      forearmLeft: { ar: 'الساعد الأيسر', en: 'Left Forearm' },
      wristRight: { ar: 'الرسغ الأيمن', en: 'Right Wrist' },
      wristLeft: { ar: 'الرسغ الأيسر', en: 'Left Wrist' },
      handRight: { ar: 'اليد اليمنى', en: 'Right Hand' },
      handLeft: { ar: 'اليد اليسرى', en: 'Left Hand' },
      fingersRight: { ar: 'أصابع اليد اليمنى', en: 'Right Fingers' },
      fingersLeft: { ar: 'أصابع اليد اليسرى', en: 'Left Fingers' },
      cervicalSpine: { ar: 'العمود الفقري العنقي', en: 'Cervical Spine' },
      thoracicSpine: { ar: 'العمود الفقري الصدري', en: 'Thoracic Spine' },
      lumbarSpine: { ar: 'العمود الفقري القطني', en: 'Lumbar Spine' },
      pelvis: { ar: 'الحوض', en: 'Pelvis' },
      hipRight: { ar: 'الورك الأيمن', en: 'Right Hip' },
      hipLeft: { ar: 'الورك الأيسر', en: 'Left Hip' },
      thighRight: { ar: 'الفخذ الأيمن', en: 'Right Thigh' },
      thighLeft: { ar: 'الفخذ الأيسر', en: 'Left Thigh' },
      kneeRight: { ar: 'الركبة اليمنى', en: 'Right Knee' },
      kneeLeft: { ar: 'الركبة اليسرى', en: 'Left Knee' },
      legRight: { ar: 'الساق الأيمن', en: 'Right Leg' },
      legLeft: { ar: 'الساق الأيسر', en: 'Left Leg' },
      ankleRight: { ar: 'الكاحل الأيمن', en: 'Right Ankle' },
      ankleLeft: { ar: 'الكاحل الأيسر', en: 'Left Ankle' },
      footRight: { ar: 'القدم اليمنى', en: 'Right Foot' },
      footLeft: { ar: 'القدم اليسرى', en: 'Left Foot' },
      toesRight: { ar: 'أصابع القدم اليمنى', en: 'Right Toes' },
      toesLeft: { ar: 'أصابع القدم اليسرى', en: 'Left Toes' },
    };
    return names[id]?.[locale as 'ar' | 'en'] || id;
  };

  const handleSelectRegion = (region: SelectedRegion) => {
    const name = getRegionName(region.id);
    setFormData(prev => ({
      ...prev,
      injurySite: prev.injurySite ? `${prev.injurySite}, ${name}` : name,
    }));
    setSelectedRegions(prev => [...prev, region]);
  };

  const handleDeselectRegion = (id: string) => {
    const name = getRegionName(id);
    setFormData(prev => ({
      ...prev,
      injurySite: prev.injurySite.split(', ').filter(item => item !== name).join(', '),
    }));
    setSelectedRegions(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRegionNotes = (id: string, notes: string) => {
    setSelectedRegions(prev =>
      prev.map(r => (r.id === id ? { ...r, notes } : r))
    );
  };

  const handleClearAllRegions = () => {
    setFormData(prev => ({ ...prev, injurySite: '' }));
    setSelectedRegions([]);
  };

  // خيارات القوائم المنسدلة
  const injuryTypeOptions = [
    { value: '', label: t('patients.newPatient.fields.injuryTypeOptions.select') || 'اختر نوع الإصابة' },
    { value: 'fracture', label: t('patients.newPatient.fields.injuryTypeOptions.fracture') || 'كسر' },
    { value: 'dislocation', label: t('patients.newPatient.fields.injuryTypeOptions.dislocation') || 'خلع' },
    { value: 'sprain', label: t('patients.newPatient.fields.injuryTypeOptions.sprain') || 'التواء' },
    { value: 'strain', label: t('patients.newPatient.fields.injuryTypeOptions.strain') || 'إجهاد عضلي' },
    { value: 'tear', label: t('patients.newPatient.fields.injuryTypeOptions.tear') || 'تمزق' },
    { value: 'crush', label: t('patients.newPatient.fields.injuryTypeOptions.crush') || 'سحق' },
    { value: 'burn', label: t('patients.newPatient.fields.injuryTypeOptions.burn') || 'حرق' },
    { value: 'other', label: t('patients.newPatient.fields.injuryTypeOptions.other') || 'أخرى' }
  ];

  const affectedJointOptions = [
    { value: '', label: t('patients.newPatient.fields.affectedJointOptions.select') || 'اختر المفصل' },
    { value: 'shoulder', label: t('patients.newPatient.fields.affectedJointOptions.shoulder') || 'الكتف' },
    { value: 'elbow', label: t('patients.newPatient.fields.affectedJointOptions.elbow') || 'المرفق' },
    { value: 'wrist', label: t('patients.newPatient.fields.affectedJointOptions.wrist') || 'الرسغ' },
    { value: 'hand', label: t('patients.newPatient.fields.affectedJointOptions.hand') || 'اليد' },
    { value: 'hip', label: t('patients.newPatient.fields.affectedJointOptions.hip') || 'الورك' },
    { value: 'knee', label: t('patients.newPatient.fields.affectedJointOptions.knee') || 'الركبة' },
    { value: 'ankle', label: t('patients.newPatient.fields.affectedJointOptions.ankle') || 'الكاحل' },
    { value: 'foot', label: t('patients.newPatient.fields.affectedJointOptions.foot') || 'القدم' },
    { value: 'spine', label: t('patients.newPatient.fields.affectedJointOptions.spine') || 'العمود الفقري' }
  ];

  const splintOrCastOptions = [
    { value: '', label: t('patients.newPatient.fields.splintOrCastOptions.select') || 'اختر' },
    { value: 'no', label: t('patients.newPatient.fields.splintOrCastOptions.no') || 'لا' },
    { value: 'splint', label: t('patients.newPatient.fields.splintOrCastOptions.splint') || 'جبيرة' },
    { value: 'cast', label: t('patients.newPatient.fields.splintOrCastOptions.cast') || 'جبس' },
    { value: 'both', label: t('patients.newPatient.fields.splintOrCastOptions.both') || 'جبيرة وجبس' }
  ];

  const surgicalOperationsOptions = [
    { value: '', label: t('patients.newPatient.fields.surgicalOperationsOptions.select') || 'اختر العملية' },
    { value: 'arthroscopy', label: t('patients.newPatient.fields.surgicalOperationsOptions.arthroscopy') || 'تنظير مفصلي' },
    { value: 'open_reduction', label: t('patients.newPatient.fields.surgicalOperationsOptions.open_reduction') || 'رد مفتوح' },
    { value: 'internal_fixation', label: t('patients.newPatient.fields.surgicalOperationsOptions.internal_fixation') || 'تثبيت داخلي' },
    { value: 'external_fixation', label: t('patients.newPatient.fields.surgicalOperationsOptions.external_fixation') || 'تثبيت خارجي' },
    { value: 'reconstruction', label: t('patients.newPatient.fields.surgicalOperationsOptions.reconstruction') || 'إعادة بناء' },
    { value: 'fusion', label: t('patients.newPatient.fields.surgicalOperationsOptions.fusion') || 'دمج فقري' },
    { value: 'replacement', label: t('patients.newPatient.fields.surgicalOperationsOptions.replacement') || 'استبدال مفصلي' },
    { value: 'none', label: t('patients.newPatient.fields.surgicalOperationsOptions.none') || 'لا توجد عمليات' }
  ];

  const physicalTherapyOptions = [
    { value: '', label: t('patients.newPatient.fields.physicalTherapyOptions.select') || 'اختر نوع العلاج' },
    { value: 'range_of_motion', label: t('patients.newPatient.fields.physicalTherapyOptions.range_of_motion') || 'تمارين المدى الحركي' },
    { value: 'strengthening', label: t('patients.newPatient.fields.physicalTherapyOptions.strengthening') || 'تمارين التقوية' },
    { value: 'stretching', label: t('patients.newPatient.fields.physicalTherapyOptions.stretching') || 'تمارين الاستطالة' },
    { value: 'balance', label: t('patients.newPatient.fields.physicalTherapyOptions.balance') || 'تمارين التوازن' },
    { value: 'gait_training', label: t('patients.newPatient.fields.physicalTherapyOptions.gait_training') || 'تدريب المشي' },
    { value: 'hydrotherapy', label: t('patients.newPatient.fields.physicalTherapyOptions.hydrotherapy') || 'العلاج المائي' },
    { value: 'electrotherapy', label: t('patients.newPatient.fields.physicalTherapyOptions.electrotherapy') || 'العلاج الكهربائي' },
    { value: 'manual_therapy', label: t('patients.newPatient.fields.physicalTherapyOptions.manual_therapy') || 'العلاج اليدوي' },
    { value: 'none', label: t('patients.newPatient.fields.physicalTherapyOptions.none') || 'لا يوجد' }
  ];

  const diagnosisOptions = [
    { value: '', label: t('patients.newPatient.fields.diagnosisOptions.select') || 'اختر التشخيص' },
    { value: 'simple_fracture', label: t('patients.newPatient.fields.diagnosisOptions.simple_fracture') || 'كسر بسيط' },
    { value: 'compound_fracture', label: t('patients.newPatient.fields.diagnosisOptions.compound_fracture') || 'كسر مركب' },
    { value: 'comminuted_fracture', label: t('patients.newPatient.fields.diagnosisOptions.comminuted_fracture') || 'كسر محطم' },
    { value: 'anterior_dislocation', label: t('patients.newPatient.fields.diagnosisOptions.anterior_dislocation') || 'خلع أمامي' },
    { value: 'posterior_dislocation', label: t('patients.newPatient.fields.diagnosisOptions.posterior_dislocation') || 'خلع خلفي' },
    { value: 'meniscus_tear', label: t('patients.newPatient.fields.diagnosisOptions.meniscus_tear') || 'تمزق الغضروف الهلالي' },
    { value: 'acl_tear', label: t('patients.newPatient.fields.diagnosisOptions.acl_tear') || 'تمزق الرباط الصليبي الأمامي' },
    { value: 'rotator_cuff_tear', label: t('patients.newPatient.fields.diagnosisOptions.rotator_cuff_tear') || 'تمزق الكفة المدورة' },
    { value: 'osteoarthritis', label: t('patients.newPatient.fields.diagnosisOptions.osteoarthritis') || 'هشاشة العظام' },
    { value: 'rheumatoid_arthritis', label: t('patients.newPatient.fields.diagnosisOptions.rheumatoid_arthritis') || 'التهاب المفاصل الروماتويدي' },
    { value: 'bursitis', label: t('patients.newPatient.fields.diagnosisOptions.bursitis') || 'التهاب الجراب' },
    { value: 'tendinitis', label: t('patients.newPatient.fields.diagnosisOptions.tendinitis') || 'التهاب الأوتار' },
    { value: 'other', label: t('patients.newPatient.fields.diagnosisOptions.other') || 'أخرى' }
  ];

  const treatmentPlanOptions = [
    { value: '', label: t('patients.newPatient.fields.treatmentPlanOptions.select') || 'اختر خطة العلاج' },
    { value: 'conservative', label: t('patients.newPatient.fields.treatmentPlanOptions.conservative') || 'علاج محافظ' },
    { value: 'surgical', label: t('patients.newPatient.fields.treatmentPlanOptions.surgical') || 'علاج جراحي' },
    { value: 'combined', label: t('patients.newPatient.fields.treatmentPlanOptions.combined') || 'علاج مدمج' },
    { value: 'physical_therapy_only', label: t('patients.newPatient.fields.treatmentPlanOptions.physical_therapy_only') || 'علاج طبيعي فقط' },
    { value: 'medication_only', label: t('patients.newPatient.fields.treatmentPlanOptions.medication_only') || 'أدوية فقط' },
    { value: 'immobilization', label: t('patients.newPatient.fields.treatmentPlanOptions.immobilization') || 'تثبيت' },
    { value: 'rehabilitation', label: t('patients.newPatient.fields.treatmentPlanOptions.rehabilitation') || 'إعادة تأهيل' }
  ];

  // دالة الإرسال (نفسها)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.phone || !formData.gender) {
      alert(t('patients.newPatient.validation.requiredFields'));
      setIsSubmitting(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const addressParts = [formData.address].filter(Boolean);
      const addressString = addressParts.length > 0 ? addressParts.join(', ') : undefined;

      const patientData: any = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        medicalHistory: formData.medicalHistory ? [formData.medicalHistory] : [],
        allergies: formData.allergies ? [formData.allergies] : [],
        currentMedications: formData.medications ? [formData.medications] : [],
      };

      if (formData.password) {
        patientData.password = formData.password;
      }
      if (addressString) {
        patientData.address = addressString;
      }
      if (formData.emergencyName || formData.emergencyPhone || formData.emergencyRelationship) {
        patientData.emergencyContact = {};
        if (formData.emergencyName) {
          patientData.emergencyContact.name = formData.emergencyName;
        }
        if (formData.emergencyPhone) {
          patientData.emergencyContact.phone = formData.emergencyPhone;
        }
        if (formData.emergencyRelationship) {
          patientData.emergencyContact.relationship = formData.emergencyRelationship;
        }
      }
      if (formData.bloodType && formData.bloodType !== '' && formData.bloodType !== 'none') {
        patientData.bloodType = formData.bloodType;
      }

      if (formData.orthopedicHistory) {
        patientData.orthopedicHistory = [formData.orthopedicHistory];
      }
      if (formData.chiefComplaint) {
        patientData.chiefComplaint = formData.chiefComplaint;
      }
      if (formData.injurySite) {
        patientData.injurySite = formData.injurySite;
      }
      if (formData.injuryNotes) {
        patientData.injuryNotes = formData.injuryNotes;
      }
      if (selectedRegions.length > 0) {
        patientData.injuryLocations = selectedRegions;
      }
      if (formData.injuryType) {
        patientData.injuryType = formData.injuryType;
      }
      if (formData.affectedJoint) {
        patientData.affectedJoint = formData.affectedJoint;
      }
      if (formData.painLevel) {
        patientData.painLevel = parseInt(formData.painLevel);
      }
      if (formData.splintOrCast) {
        patientData.splintOrCast = formData.splintOrCast;
      }
      if (formData.surgicalOperations) {
        patientData.surgicalOperations = [formData.surgicalOperations];
      }
      if (formData.physicalTherapy) {
        patientData.physicalTherapy = formData.physicalTherapy;
      }
      if (formData.diagnosis) {
        patientData.diagnosis = [formData.diagnosis];
      }
      if (formData.treatmentPlan) {
        patientData.treatmentPlan = [formData.treatmentPlan];
      }
      if (formData.imaging) {
        patientData.imagingStudies = [{
          type: formData.imaging,
          date: new Date().toISOString()
        }];
      }

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        alert(t('patients.newPatient.success.patientAdded'));
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          address: '',
          email: '',
          password: '',
          bloodType: '',
          allergies: '',
          medications: '',
          medicalHistory: '',
          familyHistory: '',
          orthopedicHistory: '',
          chiefComplaint: '',
          injurySite: '',
          injuryNotes: '',
          injuryType: '',
          affectedJoint: '',
          painLevel: '',
          splintOrCast: '',
          surgicalOperations: '',
          physicalTherapy: '',
          diagnosis: '',
          treatmentPlan: '',
          imaging: '',
          followUpDate: '',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelationship: ''
        });
        setSelectedRegions([]);
        setActiveSection('personal');
        // إعادة تعيين حالات التعديل اليدوي
        setIsEmailManuallyEdited(false);
        setIsPasswordManuallyEdited(false);
        window.location.href = '/patients';
      } else {
        let errorMessage = 'Failed to create patient';
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.details || errorData.error || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(t('patients.newPatient.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'personal', label: t('patients.newPatient.sections.personal'), icon: Users },
    { id: 'login', label: t('patients.newPatient.sections.login'), icon: Lock },
    { id: 'medical', label: t('patients.newPatient.sections.medical'), icon: FileText },
    { id: 'orthopedic', label: t('patients.newPatient.sections.orthopedic'), icon: AlertCircle },
    { id: 'emergency', label: t('patients.newPatient.sections.emergency'), icon: Phone }
  ];

  return (
    <ProtectedRoute>
      <SidebarLayout
        title={t('patients.newPatient.title')}
        description={t('patients.newPatient.description')}
        dense
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/patients"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('patients.newPatient.backToPatients')}</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                    activeSection === section.id
                      ? 'border border-blue-200 bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information Section */}
          {activeSection === 'personal' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Users className="mr-2 h-4 w-4 text-blue-600" />
                {t('patients.newPatient.sections.personal')}
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.firstName')} *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.lastName')} *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.dateOfBirth')} *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.gender')} *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('patients.newPatient.fields.genderOptions.select')}</option>
                    <option value="male">{t('patients.newPatient.fields.genderOptions.male')}</option>
                    <option value="female">{t('patients.newPatient.fields.genderOptions.female')}</option>
                    <option value="other">{t('patients.newPatient.fields.genderOptions.other')}</option>
                    <option value="prefer-not-to-say">{t('patients.newPatient.fields.genderOptions.preferNotToSay')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.address')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Information Section */}
          {activeSection === 'login' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Lock className="mr-2 h-4 w-4 text-blue-600" />
                {t('patients.newPatient.sections.login')}
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.email')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('patients.newPatient.hints.emailAuto') || 'سيتم توليد البريد تلقائياً من رقم الجوال'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.password')}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('patients.newPatient.hints.passwordAuto') || 'سيتم توليد كلمة المرور تلقائياً'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Section */}
          {activeSection === 'medical' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                {t('patients.newPatient.sections.medical')}
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="bloodType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.bloodType')}
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">{t('patients.newPatient.fields.bloodTypeOptions.select')}</option>
                    <option value="A+">{t('patients.newPatient.fields.bloodTypeOptions.A+')}</option>
                    <option value="A-">{t('patients.newPatient.fields.bloodTypeOptions.A-')}</option>
                    <option value="B+">{t('patients.newPatient.fields.bloodTypeOptions.B+')}</option>
                    <option value="B-">{t('patients.newPatient.fields.bloodTypeOptions.B-')}</option>
                    <option value="AB+">{t('patients.newPatient.fields.bloodTypeOptions.AB+')}</option>
                    <option value="AB-">{t('patients.newPatient.fields.bloodTypeOptions.AB-')}</option>
                    <option value="O+">{t('patients.newPatient.fields.bloodTypeOptions.O+')}</option>
                    <option value="O-">{t('patients.newPatient.fields.bloodTypeOptions.O-')}</option>
                    <option value="none">{t('patients.newPatient.fields.bloodTypeOptions.none')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="allergies" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.allergies')}
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.allergies')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="medications" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.currentMedications')}
                  </label>
                  <input
                    type="text"
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.medications')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="medicalHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.medicalHistory')}
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.medicalHistory')}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="familyHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.familyHistory')}
                  </label>
                  <textarea
                    id="familyHistory"
                    name="familyHistory"
                    value={formData.familyHistory}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.familyHistory')}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Orthopedic Information Section */}
          {activeSection === 'orthopedic' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
                {t('patients.newPatient.sections.orthopedic')}
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div className="md:col-span-2">
                  <label htmlFor="orthopedicHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.orthopedicHistory')}
                  </label>
                  <textarea
                    id="orthopedicHistory"
                    name="orthopedicHistory"
                    value={formData.orthopedicHistory}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.orthopedicHistory')}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="chiefComplaint" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.chiefComplaint')}
                  </label>
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.chiefComplaint')}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* خريطة موضع الإصابة */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold mb-2">{t('patients.newPatient.sections.injuryMap')}</h4>
                  <SkeletonMap
                    selectedRegions={selectedRegions}
                    onSelectRegion={handleSelectRegion}
                    onDeselectRegion={handleDeselectRegion}
                    onClearAll={handleClearAllRegions}
                    onUpdateRegionNotes={handleUpdateRegionNotes}
                    lang={locale}
                  />
                  <div className="mt-3">
                    <label htmlFor="injuryNotes" className="block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.injuryNotes')}
                    </label>
                    <textarea
                      id="injuryNotes"
                      name="injuryNotes"
                      value={formData.injuryNotes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder={t('patients.newPatient.placeholders.injuryNotes')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="injurySite" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.injurySite')}
                  </label>
                  <input
                    type="text"
                    id="injurySite"
                    name="injurySite"
                    value={formData.injurySite}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.injurySite')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>

                {/* نوع الإصابة - Dropdown */}
                <div>
                  <label htmlFor="injuryType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.injuryType')}
                  </label>
                  <select
                    id="injuryType"
                    name="injuryType"
                    value={formData.injuryType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {injuryTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* المفصل المصاب - Dropdown */}
                <div>
                  <label htmlFor="affectedJoint" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.affectedJoint')}
                  </label>
                  <select
                    id="affectedJoint"
                    name="affectedJoint"
                    value={formData.affectedJoint}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {affectedJointOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="painLevel" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.painLevel')}
                  </label>
                  <input
                    type="number"
                    id="painLevel"
                    name="painLevel"
                    min="0"
                    max="10"
                    value={formData.painLevel}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* الجبيرة أو الجبس - Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="splintOrCast" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.splintOrCast')}
                  </label>
                  <select
                    id="splintOrCast"
                    name="splintOrCast"
                    value={formData.splintOrCast}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {splintOrCastOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* العمليات الجراحية - Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="surgicalOperations" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.surgicalOperations')}
                  </label>
                  <select
                    id="surgicalOperations"
                    name="surgicalOperations"
                    value={formData.surgicalOperations}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {surgicalOperationsOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* العلاج الطبيعي - Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="physicalTherapy" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.physicalTherapy')}
                  </label>
                  <select
                    id="physicalTherapy"
                    name="physicalTherapy"
                    value={formData.physicalTherapy}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {physicalTherapyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* التشخيص - Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="diagnosis" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.diagnosis')}
                  </label>
                  <select
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {diagnosisOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* خطة العلاج - Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="treatmentPlan" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.treatmentPlan')}
                  </label>
                  <select
                    id="treatmentPlan"
                    name="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    {treatmentPlanOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="imaging" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.imaging')}
                  </label>
                  <select
                    id="imaging"
                    name="imaging"
                    value={formData.imaging}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('patients.newPatient.fields.imagingOptions.select')}</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="followUpDate" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.followUpDate')}
                  </label>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section */}
          {activeSection === 'emergency' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Phone className="mr-2 h-4 w-4 text-blue-600" />
                {t('patients.newPatient.sections.emergency')}
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="emergencyName" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.emergencyName')}
                  </label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.emergencyPhone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="emergencyRelationship" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    {t('patients.newPatient.fields.emergencyRelationship')}
                  </label>
                  <input
                    type="text"
                    id="emergencyRelationship"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    placeholder={t('patients.newPatient.placeholders.emergencyRelationship')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? t('patients.newPatient.buttons.saving') : t('patients.newPatient.buttons.savePatient')}
            </button>
            <Link
              href="/patients"
              className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              {t('patients.newPatient.buttons.cancel')}
            </Link>
          </div>
        </form>
      </SidebarLayout>
    </ProtectedRoute>
  );
     }

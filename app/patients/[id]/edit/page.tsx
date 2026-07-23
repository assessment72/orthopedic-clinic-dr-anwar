'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Heart,
  User,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';
import { useTranslations } from '../../../hooks/useTranslations';

export default function PatientEditPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeSection, setActiveSection] = useState('personal');

  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodType: '',
    assignedDoctor: '',
    medicalHistory: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    // Orthopedic Information
    orthopedicHistory: '',
    chiefComplaint: '',
    injurySite: '',
    injuryType: '',
    affectedJoint: '',
    painLevel: '',
    splintOrCast: '',
    surgicalOperations: '',
    physicalTherapy: '',
    diagnosis: '',
    treatmentPlan: '',
    imaging: '',
    followUpDate: ''
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
          const mh = data.medicalHistory;
          const medicalHistoryStr = Array.isArray(mh)
            ? mh.join('\n')
            : typeof mh === 'string'
              ? mh
              : '';
          const orthopedicHistoryStr = Array.isArray(data.orthopedicHistory)
            ? data.orthopedicHistory.join('\n')
            : data.orthopedicHistory || '';
          const surgicalOpsStr = Array.isArray(data.surgicalOperations)
            ? data.surgicalOperations.join('\n')
            : data.surgicalOperations || '';
          const diagnosisStr = Array.isArray(data.diagnosis)
            ? data.diagnosis.join('\n')
            : data.diagnosis || '';
          const treatmentPlanStr = Array.isArray(data.treatmentPlan)
            ? data.treatmentPlan.join('\n')
            : data.treatmentPlan || '';
          const imagingType = Array.isArray(data.imagingStudies) && data.imagingStudies.length > 0
            ? data.imagingStudies[0].type
            : '';
          // Get the most recent followUp appointment date
          const followUpDateStr = Array.isArray(data.followUpAppointments) && data.followUpAppointments.length > 0
            ? new Date(data.followUpAppointments[data.followUpAppointments.length - 1].date).toISOString().split('T')[0]
            : '';

          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            gender: data.gender || '',
            address: data.address || '',
            bloodType: data.bloodType || '',
            assignedDoctor: data.assignedDoctor || '',
            medicalHistory: medicalHistoryStr,
            emergencyContact: {
              name: data.emergencyContact?.name || '',
              relationship: data.emergencyContact?.relationship || '',
              phone: data.emergencyContact?.phone || ''
            },
            // Orthopedic fields
            orthopedicHistory: orthopedicHistoryStr,
            chiefComplaint: data.chiefComplaint || '',
            injurySite: data.injurySite || '',
            injuryType: data.injuryType || '',
            affectedJoint: data.affectedJoint || '',
            painLevel: data.painLevel !== undefined && data.painLevel !== null ? String(data.painLevel) : '',
            splintOrCast: data.splintOrCast || '',
            surgicalOperations: surgicalOpsStr,
            physicalTherapy: data.physicalTherapy || '',
            diagnosis: diagnosisStr,
            treatmentPlan: treatmentPlanStr,
            imaging: imagingType,
            followUpDate: followUpDateStr
          });
        } else {
          setError(t('patients.newPatient.edit.patientNotFound'));
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        setError(t('patients.newPatient.edit.errorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPatient();
    }
  }, [params.id, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare orthopedic data
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bloodType: formData.bloodType,
        assignedDoctor: formData.assignedDoctor,
        medicalHistory: formData.medicalHistory ? [formData.medicalHistory] : [],
        emergencyContact: formData.emergencyContact.name || formData.emergencyContact.phone
          ? formData.emergencyContact
          : undefined,
      };

      // Add orthopedic fields
      if (formData.orthopedicHistory) {
        updateData.orthopedicHistory = [formData.orthopedicHistory];
      }
      if (formData.chiefComplaint) {
        updateData.chiefComplaint = formData.chiefComplaint;
      }
      if (formData.injurySite) {
        updateData.injurySite = formData.injurySite;
      }
      if (formData.injuryType) {
        updateData.injuryType = formData.injuryType;
      }
      if (formData.affectedJoint) {
        updateData.affectedJoint = formData.affectedJoint;
      }
      if (formData.painLevel) {
        updateData.painLevel = parseInt(formData.painLevel);
      }
      if (formData.splintOrCast) {
        updateData.splintOrCast = formData.splintOrCast;
      }
      if (formData.surgicalOperations) {
        updateData.surgicalOperations = [formData.surgicalOperations];
      }
      if (formData.physicalTherapy) {
        updateData.physicalTherapy = formData.physicalTherapy;
      }
      if (formData.diagnosis) {
        updateData.diagnosis = [formData.diagnosis];
      }
      if (formData.treatmentPlan) {
        updateData.treatmentPlan = [formData.treatmentPlan];
      }
      if (formData.imaging) {
        updateData.imagingStudies = [{
          type: formData.imaging,
          date: new Date().toISOString()
        }];
      }
      if (formData.followUpDate) {
        updateData.followUpDate = formData.followUpDate;
      }

      const response = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess(t('patients.newPatient.edit.updatedSuccessfully'));
        setTimeout(() => {
          router.push(`/patients/${params.id}`);
        }, 1500);
      } else {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          details?: string | string[];
        };
        const detailStr = errorData.details
          ? Array.isArray(errorData.details)
            ? errorData.details.join(' ')
            : String(errorData.details)
          : '';
        setError(
          [errorData.error || errorData.message || t('patients.newPatient.edit.updateFailed'), detailStr]
            .filter(Boolean)
            .join(': ')
        );
      }
    } catch (err) {
      setError(t('patients.newPatient.edit.errorOccurred'));
      console.error('Error updating patient:', err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: t('patients.newPatient.edit.personalInfo'), icon: User },
    { id: 'medical', label: t('patients.newPatient.edit.medicalInfo'), icon: FileText },
    { id: 'orthopedic', label: t('patients.newPatient.edit.orthopedicInfo'), icon: AlertCircle },
    { id: 'emergency', label: t('patients.newPatient.edit.emergencyContact'), icon: Phone },
    { id: 'additional', label: t('patients.newPatient.edit.additionalInfo'), icon: Users }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title={t('patients.newPatient.edit.title')} 
          description={t('patients.newPatient.edit.description')}
          dense
        >
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error && !patient) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title={t('patients.newPatient.edit.patientNotFound')} 
          description={t('patients.newPatient.edit.notFoundDescription')}
          dense
        >
          <div className="py-8 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('patients.newPatient.edit.patientNotFound')}</h3>
            <p className="mt-1 text-xs text-gray-700 sm:text-sm">
              {t('patients.newPatient.edit.notFoundDescription')}
            </p>
            <div className="mt-4">
              <Link
                href="/patients"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('patients.newPatient.edit.backToPatients')}</span>
              </Link>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('patients.newPatient.edit.title')} 
        description={`${t('patients.newPatient.edit.editPatient')}: ${patient?.name}`}
        dense
      >
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-2">
            <Link 
              href={`/patients/${params.id}`}
              className="mb-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('patients.newPatient.edit.backToPatient')}
            </Link>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-2 rounded-md border border-green-200 bg-green-50 p-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm mb-3">
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

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                  <User className="mr-2 h-4 w-4 text-blue-600" />
                  {t('patients.newPatient.edit.personalInfo')}
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.fullName')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.dateOfBirth')} *
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.gender')} *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('patients.newPatient.edit.genderSelect')}</option>
                      <option value="male">{t('patients.newPatient.fields.genderOptions.male')}</option>
                      <option value="female">{t('patients.newPatient.fields.genderOptions.female')}</option>
                      <option value="other">{t('patients.newPatient.fields.genderOptions.other')}</option>
                      <option value="prefer-not-to-say">{t('patients.newPatient.fields.genderOptions.preferNotToSay')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.address')}
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bloodType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.bloodType')}
                    </label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('patients.newPatient.edit.bloodTypeSelect')}</option>
                      <option value="A+">{t('patients.newPatient.fields.bloodTypeOptions.A+')}</option>
                      <option value="A-">{t('patients.newPatient.fields.bloodTypeOptions.A-')}</option>
                      <option value="B+">{t('patients.newPatient.fields.bloodTypeOptions.B+')}</option>
                      <option value="B-">{t('patients.newPatient.fields.bloodTypeOptions.B-')}</option>
                      <option value="AB+">{t('patients.newPatient.fields.bloodTypeOptions.AB+')}</option>
                      <option value="AB-">{t('patients.newPatient.fields.bloodTypeOptions.AB-')}</option>
                      <option value="O+">{t('patients.newPatient.fields.bloodTypeOptions.O+')}</option>
                      <option value="O-">{t('patients.newPatient.fields.bloodTypeOptions.O-')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information */}
            {activeSection === 'medical' && (
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  {t('patients.newPatient.edit.medicalInfo')}
                </h3>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="medicalHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.medicalHistory')}
                    </label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder={t('patients.newPatient.edit.medicalHistoryPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Orthopedic Information */}
            {activeSection === 'orthopedic' && (
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                  <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
                  {t('patients.newPatient.edit.orthopedicInfo')}
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
                    />
                  </div>
                  <div>
                    <label htmlFor="injuryType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.injuryType')}
                    </label>
                    <input
                      type="text"
                      id="injuryType"
                      name="injuryType"
                      value={formData.injuryType}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.injuryType')}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="affectedJoint" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.affectedJoint')}
                    </label>
                    <input
                      type="text"
                      id="affectedJoint"
                      name="affectedJoint"
                      value={formData.affectedJoint}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.affectedJoint')}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
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
                  <div className="md:col-span-2">
                    <label htmlFor="splintOrCast" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.splintOrCast')}
                    </label>
                    <input
                      type="text"
                      id="splintOrCast"
                      name="splintOrCast"
                      value={formData.splintOrCast}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.splintOrCast')}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="surgicalOperations" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.surgicalOperations')}
                    </label>
                    <textarea
                      id="surgicalOperations"
                      name="surgicalOperations"
                      value={formData.surgicalOperations}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.surgicalOperations')}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="physicalTherapy" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.physicalTherapy')}
                    </label>
                    <textarea
                      id="physicalTherapy"
                      name="physicalTherapy"
                      value={formData.physicalTherapy}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.physicalTherapy')}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="diagnosis" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.diagnosis')}
                    </label>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.diagnosis')}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="treatmentPlan" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.fields.treatmentPlan')}
                    </label>
                    <textarea
                      id="treatmentPlan"
                      name="treatmentPlan"
                      value={formData.treatmentPlan}
                      onChange={handleInputChange}
                      placeholder={t('patients.newPatient.placeholders.treatmentPlan')}
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
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
                      <option value="">-</option>
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

            {/* Emergency Contact */}
            {activeSection === 'emergency' && (
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                  <Phone className="mr-2 h-4 w-4 text-blue-600" />
                  {t('patients.newPatient.edit.emergencyContact')}
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                  <div>
                    <label htmlFor="emergencyContact.name" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.contactName')}
                    </label>
                    <input
                      type="text"
                      id="emergencyContact.name"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact.relationship" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.relationship')}
                    </label>
                    <input
                      type="text"
                      id="emergencyContact.relationship"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact.phone" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.contactPhone')}
                    </label>
                    <input
                      type="tel"
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {activeSection === 'additional' && (
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                  <Users className="mr-2 h-4 w-4 text-blue-600" />
                  {t('patients.newPatient.edit.additionalInfo')}
                </h3>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="assignedDoctor" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                      {t('patients.newPatient.edit.assignedDoctor')}
                    </label>
                    <input
                      type="text"
                      id="assignedDoctor"
                      name="assignedDoctor"
                      value={formData.assignedDoctor}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder={t('patients.newPatient.edit.assignedDoctorPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Link
                href={`/patients/${params.id}`}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                {t('patients.newPatient.edit.cancel')}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('patients.newPatient.edit.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('patients.newPatient.edit.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

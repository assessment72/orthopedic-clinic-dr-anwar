'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ArrowLeft, 
  Save, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Lock,
  Bone
} from 'lucide-react';
import ProtectedRoute from '../../protected-route';
import SidebarLayout from '../../components/sidebar-layout';
import { useTranslations } from '../../hooks/useTranslations';

export default function NewPatientPage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // User Login Information
    email: '',
    password: '',
    
    // Orthopedic Medical Information
    bloodType: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
    familyHistory: '',
    
    // Orthopedic Specific Fields
    injuryType: '',
    affectedArea: '',
    injuryDate: '',
    previousSurgeries: '',
    currentPain: '',
    mobilityStatus: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: ''
  });

  const [activeSection, setActiveSection] = useState('personal');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate required fields: name, email, birthdate, phone, gender, and orthopedic specific fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.phone || !formData.gender || !formData.injuryType || !formData.affectedArea) {
      alert(t('patients.newPatient.validation.requiredFields'));
      setIsSubmitting(false);
      return;
    }
    
    // If password is provided, validate it
    if (formData.password && formData.password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare the data for the API
      const addressParts = [formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean);
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
        
        // Orthopedic specific data
        orthopedicInfo: {
          injuryType: formData.injuryType,
          affectedArea: formData.affectedArea,
          injuryDate: formData.injuryDate,
          previousSurgeries: formData.previousSurgeries,
          currentPain: formData.currentPain,
          mobilityStatus: formData.mobilityStatus,
          clinic: 'عيادة الدكتور أنور - تخصص العظام'
        }
      };
      
      // Add password if provided (for patient login)
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

      // Debug: Log the data being sent
      console.log('Form data being sent:', patientData);
      console.log('Orthopedic info:', patientData.orthopedicInfo);

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        alert('تم إضافة المريض بنجاح');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          email: '',
          password: '',
          bloodType: '',
          allergies: '',
          medications: '',
          medicalHistory: '',
          familyHistory: '',
          injuryType: '',
          affectedArea: '',
          injuryDate: '',
          previousSurgeries: '',
          currentPain: '',
          mobilityStatus: '',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelationship: ''
        });
        setActiveSection('personal');
        // Redirect to patients list
        window.location.href = '/patients';
      } else {
        // Try to parse error response
        let errorMessage = 'فشل إنشاء المريض';
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.details || errorData.error || errorMessage;
          } else {
            errorMessage = `خطأ في الخادم: ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          errorMessage = `خطأ في الخادم: ${response.status} ${response.statusText}`;
        }
        console.error('Error response status:', response.status, 'Message:', errorMessage);
        alert(`خطأ: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(t('patients.newPatient.errors.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'المعلومات الشخصية', icon: Users },
    { id: 'orthopedic', label: 'معلومات العظام', icon: Bone },
    { id: 'medical', label: 'السجل الطبي', icon: FileText },
    { id: 'login', label: 'بيانات الدخول', icon: Lock },
    { id: 'emergency', label: 'جهة الاتصال الطارئة', icon: Phone }
  ];

  return (
    <ProtectedRoute>
      <SidebarLayout
        title="تسجيل مريض جديد - عيادة الدكتور أنور (العظام)"
        description="إضافة مريض جديد إلى نظام عيادة الدكتور أنور المتخصصة في أمراض العظام"
        dense
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/patients"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة إلى قائمة المرضى</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <Bone className="h-4 w-4" />
            <span>عيادة الدكتور أنور - تخصص العظام</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Section Navigation */}
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
                المعلومات الشخصية
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    الاسم الأول *
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
                    اسم العائلة *
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
                    تاريخ الميلاد *
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
                    الجنس *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر --</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                    <option value="other">آخر</option>
                    <option value="prefer-not-to-say">أفضل عدم الإفصاح</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    رقم الهاتف *
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
                    العنوان
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
                <div>
                  <label htmlFor="city" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    المدينة
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    المنطقة
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    الرمز البريدي
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Orthopedic Information Section */}
          {activeSection === 'orthopedic' && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Bone className="mr-2 h-4 w-4 text-blue-600" />
                معلومات العظام والإصابات
              </h3>
              <div className="mb-3 rounded-md border border-blue-200 bg-white p-2">
                <p className="text-xs text-blue-800">
                  <strong>ملاحظة:</strong> يرجى ملء جميع المعلومات المتعلقة بالإصابة أو الحالة العظمية للمريض
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="injuryType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    نوع الإصابة *
                  </label>
                  <select
                    id="injuryType"
                    name="injuryType"
                    required
                    value={formData.injuryType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر نوع الإصابة --</option>
                    <option value="fracture">كسر</option>
                    <option value="sprain">التواء</option>
                    <option value="strain">شد عضلي</option>
                    <option value="arthritis">التهاب المفاصل</option>
                    <option value="osteoporosis">هشاشة العظام</option>
                    <option value="dislocation">خلع</option>
                    <option value="tendonitis">التهاب الأوتار</option>
                    <option value="bursitis">التهاب الجراب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="affectedArea" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    المنطقة المصابة *
                  </label>
                  <select
                    id="affectedArea"
                    name="affectedArea"
                    required
                    value={formData.affectedArea}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر المنطقة --</option>
                    <option value="head">الرأس</option>
                    <option value="neck">الرقبة</option>
                    <option value="shoulder">الكتف</option>
                    <option value="upper-arm">الذراع العليا</option>
                    <option value="elbow">الكوع</option>
                    <option value="forearm">الساعد</option>
                    <option value="wrist">المعصم</option>
                    <option value="hand">اليد</option>
                    <option value="spine">العمود الفقري</option>
                    <option value="chest">الصدر</option>
                    <option value="abdomen">البطن</option>
                    <option value="hip">الورك</option>
                    <option value="thigh">الفخذ</option>
                    <option value="knee">الركبة</option>
                    <option value="shin">الساق</option>
                    <option value="ankle">الكاحل</option>
                    <option value="foot">القدم</option>
                    <option value="multiple">متعددة</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="injuryDate" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    تاريخ الإصابة
                  </label>
                  <input
                    type="date"
                    id="injuryDate"
                    name="injuryDate"
                    value={formData.injuryDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="currentPain" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    مستوى الألم الحالي
                  </label>
                  <select
                    id="currentPain"
                    name="currentPain"
                    value={formData.currentPain}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر --</option>
                    <option value="none">لا يوجد ألم</option>
                    <option value="mild">خفيف</option>
                    <option value="moderate">متوسط</option>
                    <option value="severe">شديد</option>
                    <option value="very-severe">شديد جداً</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mobilityStatus" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    حالة الحركة
                  </label>
                  <select
                    id="mobilityStatus"
                    name="mobilityStatus"
                    value={formData.mobilityStatus}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر --</option>
                    <option value="full">حركة كاملة</option>
                    <option value="limited">حركة محدودة</option>
                    <option value="very-limited">حركة محدودة جداً</option>
                    <option value="immobilized">مثبتة</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="previousSurgeries" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    العمليات الجراحية السابقة
                  </label>
                  <textarea
                    id="previousSurgeries"
                    name="previousSurgeries"
                    rows={3}
                    value={formData.previousSurgeries}
                    onChange={handleInputChange}
                    placeholder="اذكر أي عمليات جراحية سابقة في العظام أو المفاصل"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Section */}
          {activeSection === 'medical' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <FileText className="mr-2 h-4 w-4 text-green-600" />
                السجل الطبي
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="bloodType" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    فصيلة الدم
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- اختر --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="none">غير معروفة</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="allergies" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    الحساسيات
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="مثال: البنسلين، المسكنات"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="medications" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    الأدوية الحالية
                  </label>
                  <textarea
                    id="medications"
                    name="medications"
                    rows={3}
                    value={formData.medications}
                    onChange={handleInputChange}
                    placeholder="اذكر جميع الأدوية التي يتناولها المريض حالياً"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="medicalHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    السجل الطبي
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={3}
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder="اذكر الأمراض السابقة والحالات الطبية المهمة"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="familyHistory" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    السجل الطبي للعائلة
                  </label>
                  <textarea
                    id="familyHistory"
                    name="familyHistory"
                    rows={3}
                    value={formData.familyHistory}
                    onChange={handleInputChange}
                    placeholder="اذكر أي أمراض وراثية أو حالات طبية في العائلة"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* User Login Information Section */}
          {activeSection === 'login' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Lock className="mr-2 h-4 w-4 text-purple-600" />
                بيانات الدخول
              </h3>
              <div className="space-y-2">
                <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 p-2">
                  <p className="text-xs text-blue-800">
                    <strong>ملاحظة:</strong> إضافة بيانات الدخول ستنشئ حساب مستخدم للمريض، مما يسمح له بالوصول إلى بوابة المريض.
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    البريد الإلكتروني *
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
                      placeholder="patient@example.com"
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">سيتم استخدام هذا البريد لدخول المريض إذا تم تعيين كلمة مرور</p>
                </div>
                <div>
                  <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    كلمة المرور {formData.password && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="اترك فارغاً إذا لم يكن للمريض وصول للدخول"
                      minLength={6}
                      className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.password 
                      ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل. سيتم إنشاء حساب مستخدم للمريض.'
                      : 'اختياري: عيّن كلمة مرور لإنشاء حساب مستخدم للوصول إلى بوابة المريض'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section */}
          {activeSection === 'emergency' && (
            <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                <Phone className="mr-2 h-4 w-4 text-red-600" />
                جهة الاتصال الطارئة
              </h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
                <div>
                  <label htmlFor="emergencyName" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    اسم جهة الاتصال
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
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyRelationship" className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    العلاقة
                  </label>
                  <input
                    type="text"
                    id="emergencyRelationship"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    placeholder="مثال: الأب، الأم، الزوج/الزوجة"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors sm:text-sm ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {index + 1}. {section.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Link
                href="/patients"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ المريض'}</span>
              </button>
            </div>
          </div>
        </form>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  AlertTriangle,
  Eye,
  Trash2,
  Search,
  Calendar,
  User,
  Bone,
  Activity,
  Stethoscope,
  Pill
} from 'lucide-react';
import ProtectedRoute from '../../../protected-route';
import SidebarLayout from '../../../components/sidebar-layout';

export default function PatientCasesPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log('=== ORTHOPEDIC CASES PAGE LOADED ===');
    console.log('Params:', params);
    console.log('Patient ID:', params.id);
    
    const fetchData = async () => {
      try {
        console.log('Fetching patient data...');
        const patientResponse = await fetch(`/api/patients/${params.id}`);
        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          console.log('Patient data:', patientData);
          setPatient(patientData);
        }

        console.log('Fetching workflows...');
        const workflowsResponse = await fetch(`/api/workflows?patientId=${params.id}`);
        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json();
          console.log('Workflows data:', workflowsData);
          setWorkflows(workflowsData.workflows || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('فشل في جلب البيانات الطبية');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.workflowType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.currentStep?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // أيقونات مخصصة لتخصص العظام والمفاصل
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'symptoms':
        return <User className="w-4 h-4 text-amber-600" />;
      case 'analysis':
        return <Bone className="w-4 h-4 text-blue-600" />; // الأشعة والتحاليل العظمية
      case 'diagnosis':
        return <Stethoscope className="w-4 h-4 text-purple-600" />; // الفحص السريري
      case 'treatment':
        return <Activity className="w-4 h-4 text-emerald-600" />; // التأهيل والعلاج الطبيعي
      case 'prescription':
        return <Pill className="w-4 h-4 text-rose-600" />; // الأدوية والمسكنات
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // مسميات الخطوات الطبية الخاصة بعيادة العظام
  const getStepLabel = (step: string) => {
    switch (step) {
      case 'symptoms':
        return 'شكوى المريض (الألم والحركة)';
      case 'analysis':
        return 'مراجعة الأشعة (X-Ray / MRI)';
      case 'diagnosis':
        return 'تشخيص إصابة العظام والمفاصل';
      case 'treatment':
        return 'الخطة العلاجية (تأهيل/حقن)';
      case 'prescription':
        return 'الوصفة الطبية والمسكنات';
      default:
        return step;
    }
  };

  const handleResumeWorkflow = (workflowId: string) => {
    window.location.href = `/ai-treatment-recommendations?workflowId=${workflowId}`;
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الحالة الطبية؟')) {
      try {
        if (!workflowId) {
          alert('خطأ: لم يتم تحديد معرف الحالة');
          return;
        }
        
        const response = await fetch(`/api/workflows/${workflowId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setWorkflows(workflows.filter(w => w.id !== workflowId));
          alert('تم حذف الحالة بنجاح');
        } else {
          const errorData = await response.json();
          alert(`فشل في الحذف: ${errorData.error || 'خطأ غير معروف'}`);
        }
      } catch (error) {
        console.error('Error deleting workflow:', error);
        alert('حدث خطأ أثناء محاولة الحذف');
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="حالات العظام والمفاصل" 
          description="عرض الحالات والملفات الطبية للمريض" 
          dense
        >
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  if (error || !patient) {
    return (
      <ProtectedRoute>
        <SidebarLayout 
          title="حالات العظام والمفاصل" 
          description="عرض الحالات والملفات الطبية للمريض" 
          dense
        >
          <div className="py-8 text-center">
            <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-red-400" />
            <h3 className="mb-1 text-sm font-semibold text-gray-900">خطأ في التحميل</h3>
            <p className="text-xs text-gray-600 sm:text-sm">{error || 'لم يتم العثور على بيانات المريض'}</p>
            <Link
              href="/patients"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة إلى قائمة المرضى
            </Link>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title="حالات العظام والمفاصل" 
        description={`الملفات والحالات الخاصة بالمريض: ${patient.name}`}
        dense
      >
        <div className="mx-auto max-w-6xl space-y-3" dir="rtl">
          {/* Header */}
          <div className="mb-2">
            <Link 
              href="/patients"
              className="mb-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى قائمة المرضى
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 sm:text-xl">حالات الدكتور أنور - {patient.name}</h1>
                <p className="text-xs text-gray-600 sm:text-sm">إدارة ومتابعة صور الأشعة، الفحوصات الحركية، وخطط العلاج</p>
              </div>
              <Link
                href={`/ai-treatment-recommendations?patientId=${patient._id}`}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Bone className="h-4 w-4" />
                <span>+ فتح حالة عظام جديدة</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="relative">
                  <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="البحث في الحالات أو خطوات العلاج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-300 py-0 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="in-progress">قيد المتابعة</option>
                  <option value="completed">مكتملة</option>
                  <option value="pending">معلقة</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workflows List */}
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            {filteredWorkflows.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredWorkflows.map((workflow) => (
                  <div key={workflow.id} className="p-3 hover:bg-gray-50 sm:p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 space-x-reverse mb-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {getStepIcon(workflow.currentStep)}
                            <span className="text-sm font-medium text-gray-900">
                              {getStepLabel(workflow.currentStep)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                            {workflow.status === 'completed' ? 'مكتملة' : workflow.status === 'in-progress' ? 'قيد المتابعة' : 'معلقة'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <span className="flex items-center space-x-1 space-x-reverse">
                              <Calendar className="w-4 h-4" />
                              <span>تاريخ الإنشاء: {new Date(workflow.createdAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                            <span className="flex items-center space-x-1 space-x-reverse">
                              <Clock className="w-4 h-4" />
                              <span>آخر تحديث: {new Date(workflow.updatedAt).toLocaleDateString('ar-EG')}</span>
                            </span>
                          </div>
                        </div>

                        {/* Workflow Progress */}
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span>مراحل العلاج العظمي:</span>
                            <div className="flex space-x-1 space-x-reverse">
                              {['symptoms', 'analysis', 'diagnosis', 'treatment', 'prescription'].map((step, index) => (
                                <div
                                  key={step}
                                  className={`w-2 h-2 rounded-full ${
                                    workflow.currentStep === step || 
                                    (workflow.currentStep === 'completed' && index <= 4) ||
                                    (workflow.currentStep === 'treatment' && index <= 3) ||
                                    (workflow.currentStep === 'diagnosis' && index <= 2) ||
                                    (workflow.currentStep === 'analysis' && index <= 1)
                                      ? 'bg-blue-500' 
                                      : 'bg-gray-300'
                                  }`}
                                  title={getStepLabel(step)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleResumeWorkflow(workflow.id)}
                          className="inline-flex items-center space-x-1 space-x-reverse px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                          <span>استكمال</span>
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="inline-flex items-center space-x-1 space-x-reverse px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bone className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 text-sm font-semibold text-gray-900">لا توجد حالات عظام مسجلة</h3>
                <p className="mb-4 text-xs text-gray-600 sm:text-sm">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'لا توجد نتائج مطابقة لخيارات البحث.' 
                    : 'لم يقم هذا المريض بأي زيارة مسجلة أو تقييم عظمي حتى الآن.'}
                </p>
                <Link
                  href={`/ai-treatment-recommendations?patientId=${patient._id}`}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Bone className="h-4 w-4" />
                  <span>بدء الحالة الطبية الأولى</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

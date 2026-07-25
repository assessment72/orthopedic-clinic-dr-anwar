'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../components/sidebar-layout';
import ProtectedRoute from '../../protected-route';
import { useTranslations } from '../../hooks/useTranslations';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Globe,
  Clock,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

const ACTION_ENUM = [
  'login_success',
  'login_failed',
  'create_patient',
  'update_patient',
  'delete_patient',
  'create_appointment',
  'update_appointment',
  'delete_appointment',
  'cancel_appointment',
  'create_invoice',
  'update_invoice',
  'delete_invoice',
  'pay_invoice',
  'void_invoice',
] as const;

const TARGET_TYPE_ENUM = [
  'patient',
  'appointment',
  'invoice',
  'user',
  'settings',
  'other',
] as const;

export default function ActivityLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, translationsLoaded } = useTranslations();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ currentPage: 1, pages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    targetType: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
  });

  // Redirect non-admin/non-doctor/non-staff
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin' && session?.user?.role !== 'doctor' && session?.user?.role !== 'staff') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20',
        search: filters.search,
        action: filters.action,
        targetType: filters.targetType,
        status: filters.status,
      });
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);

      const res = await fetch(`/api/admin/activity-logs?${queryParams}`);
      const data = await res.json();
      if (data.activities) {
        setActivities(data.activities);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (translationsLoaded && session?.user?.role && ['admin', 'doctor', 'staff'].includes(session.user.role)) {
      fetchActivities();
    }
  }, [filters.page, filters.action, filters.targetType, filters.status, session, translationsLoaded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderDetails = (details: any) => {
    if (!details) return '-';
    if (typeof details === 'object') {
      const parts: string[] = [];
      if (details.patientName) parts.push(details.patientName);
      if (details.doctorName) parts.push(details.doctorName);
      if (details.invoiceNumber) parts.push(details.invoiceNumber);
      if (details.patientEmail) parts.push(details.patientEmail);
      if (details.total) parts.push(`Total: ${details.total}`);
      if (details.amount) parts.push(`Amount: ${details.amount}`);
      if (details.paymentMethod) parts.push(`Method: ${details.paymentMethod}`);
      if (details.newStatus) parts.push(`→ ${details.newStatus}`);
      if (details.newInvoiceStatus) parts.push(`→ ${details.newInvoiceStatus}`);
      if (parts.length > 0) return parts.join(' | ');
      // Fallback: show as JSON snippet
      const json = JSON.stringify(details);
      return json.length > 60 ? json.slice(0, 60) + '...' : json;
    }
    return String(details);
  };

  const targetDisplay = (act: any) => {
    const parts: string[] = [];
    if (act.targetType) parts.push(`[${act.targetType}]`);
    if (act.target) parts.push(act.target);
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  if (status === 'loading' || (loading && activities.length === 0)) {
    return (
      <ProtectedRoute>
        <SidebarLayout
          title={t('activity.logs.title') || 'Activity Logs'}
          description={t('activity.logs.description') || 'Monitor all system activities and changes'}
        >
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout
        title={t('activity.logs.title') || 'Activity Logs'}
        description={t('activity.logs.description') || 'Monitor all system activities and changes'}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/settings"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('activity.logs.backToSettings') || 'Back to Settings'}
            </Link>
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('activity.logs.search') || 'Search email, name, IP...'}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Action filter */}
              <select
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option value="">{t('activity.logs.allActions') || 'All Actions'}</option>
                {ACTION_ENUM.map((a) => (
                  <option key={a} value={a}>
                    {t(`activity.actions.${a}`) || a}
                  </option>
                ))}
              </select>

              {/* Target type filter */}
              <select
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.targetType}
                onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              >
                <option value="">{t('activity.logs.allTargetTypes') || 'All Target Types'}</option>
                {TARGET_TYPE_ENUM.map((tt) => (
                  <option key={tt} value={tt}>
                    {t(`activity.targetTypes.${tt}`) || tt}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">{t('activity.logs.allStatuses') || 'All Statuses'}</option>
                <option value="success">{t('activity.logs.success') || 'Success'}</option>
                <option value="failed">{t('activity.logs.failed') || 'Failed'}</option>
              </select>

              {/* Date filters */}
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                placeholder={t('activity.logs.startDate') || 'Start Date'}
              />
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder={t('activity.logs.endDate') || 'End Date'}
              />

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Filter className="h-4 w-4" />
                {t('activity.logs.searchBtn') || 'Search'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">{t('activity.logs.user') || 'User'}</th>
                    <th className="px-4 py-3">{t('activity.logs.action') || 'Action'}</th>
                    <th className="px-4 py-3">{t('activity.logs.target') || 'Target'}</th>
                    <th className="px-4 py-3">{t('activity.logs.details') || 'Details'}</th>
                    <th className="px-4 py-3">{t('activity.logs.ip') || 'IP Address'}</th>
                    <th className="px-4 py-3">{t('activity.logs.status') || 'Status'}</th>
                    <th className="px-4 py-3">{t('activity.logs.date') || 'Date & Time'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {activity.userName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">{activity.userEmail || '-'}</div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-sm">
                          {t(`activity.actions.${activity.action}`) || activity.action}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {targetDisplay(activity)}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                        {renderDetails(activity.details)}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3">
                        <div className="flex items-center text-gray-700 text-xs">
                          <Globe className="mr-1 h-3.5 w-3.5 text-gray-400" />
                          {activity.ip || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {activity.status === 'success' ? (
                          <div className="flex items-center text-green-600">
                            <ShieldCheck className="mr-1.5 h-4 w-4" />
                            {t('activity.logs.success') || 'Success'}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center text-red-600">
                              <ShieldAlert className="mr-1.5 h-4 w-4" />
                              {t('activity.logs.failed') || 'Failed'}
                            </div>
                            {activity.error && (
                              <div className="text-[10px] text-red-400">{activity.error}</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center text-gray-900 text-xs">
                          <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                          {formatDate(activity.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                        {t('activity.logs.noResults') || 'No activity logs found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <div className="text-xs text-gray-500">
                  {t('activity.logs.showing') || 'Showing page'} {pagination.currentPage}{' '}
                  {t('activity.logs.of') || 'of'} {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.currentPage === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={pagination.currentPage === pagination.pages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '../../components/sidebar-layout';
import ProtectedRoute from '../../protected-route';
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function LoginActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ currentPage: 1, pages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    page: 1
  });

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
        search: filters.search,
        status: filters.status,
        role: filters.role,
        limit: '20'
      });
      const res = await fetch(`/api/admin/login-activity?${queryParams}`);
      const data = await res.json();
      if (data.activities) {
        setActivities(data.activities);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch login activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role && ['admin', 'doctor', 'staff'].includes(session.user.role)) {
      fetchActivities();
    }
  }, [filters.page, filters.status, filters.role, session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (status === 'loading' || (loading && activities.length === 0)) {
    return (
      <ProtectedRoute>
        <SidebarLayout title="Login Activity" description="Monitor system access logs">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </SidebarLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarLayout title="Login Activity" description="Monitor system access logs">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/settings" className="flex items-center text-sm text-gray-600 hover:text-blue-600">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
            </Link>
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search email, name, IP..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <select
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              {session?.user?.role === 'admin' && (
                <select
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="patient">Patient</option>
                </select>
              )}
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Device / OS</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{activity.userName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{activity.email}</div>
                        <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 uppercase">
                          {activity.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activity.status === 'success' ? (
                          <div className="flex items-center text-green-600">
                            <ShieldCheck className="mr-1.5 h-4 w-4" /> Success
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center text-red-600">
                              <ShieldAlert className="mr-1.5 h-4 w-4" /> Failed
                            </div>
                            <div className="text-[10px] text-red-400">{activity.reason}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          {getDeviceIcon(activity.deviceType)}
                          <span>{activity.browser || 'Unknown'}</span>
                        </div>
                        <div className="text-xs text-gray-500">{activity.os || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <Globe className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                          {activity.ipAddress || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900">
                          <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                          {formatDate(activity.loginAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No login activities found.
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
                  Showing page {pagination.currentPage} of {pagination.pages}
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

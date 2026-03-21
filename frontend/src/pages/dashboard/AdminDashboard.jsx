import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { paymentService } from '../../api/paymentService';
import { withdrawalService } from '../../api/withdrawalService';
import { disputeService } from '../../api/disputeService';
import { jobService } from '../../api/jobService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiUsers, HiBriefcase, HiCash, HiExclamationCircle, HiCurrencyDollar, HiFlag } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getUsers(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      paymentService.getAll(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      withdrawalService.getPending(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      disputeService.getAll(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      jobService.search({ page: 0, size: 1 }).catch(() => ({ data: { data: { totalElements: 0 } } })),
    ]).then(([usersRes, paymentsRes, withdrawalsRes, disputesRes, jobsRes]) => {
      setStats({
        totalUsers: usersRes.data.data?.totalElements ?? 0,
        totalPayments: paymentsRes.data.data?.totalElements ?? 0,
        pendingWithdrawals: withdrawalsRes.data.data?.totalElements ?? 0,
        openDisputes: disputesRes.data.data?.totalElements ?? 0,
        totalJobs: jobsRes.data.data?.totalElements ?? 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: HiUsers, color: 'bg-indigo-100 text-indigo-700', to: '/admin/users' },
    { label: 'Total Jobs', value: stats.totalJobs, icon: HiBriefcase, color: 'bg-blue-100 text-blue-700', to: null },
    { label: 'Total Payments', value: stats.totalPayments, icon: HiCurrencyDollar, color: 'bg-green-100 text-green-700', to: '/admin/payments' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: HiCash, color: 'bg-yellow-100 text-yellow-700', to: '/admin/withdrawals' },
    { label: 'Open Disputes', value: stats.openDisputes, icon: HiExclamationCircle, color: 'bg-red-100 text-red-700', to: '/admin/disputes' },
  ];

  const quickLinks = [
    { label: 'Manage Users', to: '/admin/users', icon: HiUsers, desc: 'Ban, unban, verify accounts' },
    { label: 'Skills & Categories', to: '/admin/skills', icon: HiFlag, desc: 'Add or remove skill categories' },
    { label: 'Review Disputes', to: '/admin/disputes', icon: HiExclamationCircle, desc: 'Resolve open contract disputes' },
    { label: 'Process Withdrawals', to: '/admin/withdrawals', icon: HiCash, desc: 'Approve or reject payout requests' },
    { label: 'Confirm Payments', to: '/admin/payments', icon: HiCurrencyDollar, desc: 'Confirm pending payments' },
    { label: 'Review Reports', to: '/admin/reports', icon: HiFlag, desc: 'Handle user-submitted reports' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const inner = (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
          return card.to
            ? <Link key={card.label} to={card.to}>{inner}</Link>
            : <div key={card.label}>{inner}</div>;
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                <link.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{link.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
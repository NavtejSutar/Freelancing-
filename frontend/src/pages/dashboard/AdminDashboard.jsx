import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { reportService } from '../../api/reportService';
import { disputeService } from '../../api/disputeService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiUsers, HiFlag, HiExclamationCircle, HiCash } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, reports: 0, disputes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getUsers(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      reportService.getAll(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
      disputeService.getAll(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
    ]).then(([usersRes, reportsRes, disputesRes]) => {
      setStats({
        users: usersRes.data.data?.totalElements || 0,
        reports: reportsRes.data.data?.totalElements || 0,
        disputes: disputesRes.data.data?.totalElements || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Users', value: stats.users, icon: HiUsers, color: 'text-blue-600 bg-blue-100', link: '/admin/users' },
    { label: 'Reports', value: stats.reports, icon: HiFlag, color: 'text-red-600 bg-red-100', link: '/admin/reports' },
    { label: 'Disputes', value: stats.disputes, icon: HiExclamationCircle, color: 'text-orange-600 bg-orange-100', link: '/admin/disputes' },
    { label: 'Withdrawals', value: '—', icon: HiCash, color: 'text-green-600 bg-green-100', link: '/admin/withdrawals' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

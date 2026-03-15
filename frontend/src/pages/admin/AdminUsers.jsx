import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiBan, HiCheck, HiClock } from 'react-icons/hi';

// ADDED: filter tab so admin can quickly see only pending clients
const TABS = ['All Users', 'Pending Verification'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Users'); // ADDED

  const loadUsers = () => {
    setLoading(true);
    adminService.getUsers(page, 10)
      .then(({ data }) => {
        setUsers(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  // ADDED: client-side filter for the pending tab
  const visibleUsers = activeTab === 'Pending Verification'
    ? users.filter(u => u.role === 'CLIENT' && !u.active && !u.banned)
    : users;

  // ADDED: count for the badge on the tab
  const pendingCount = users.filter(u => u.role === 'CLIENT' && !u.active && !u.banned).length;

  const handleBan = async (id) => {
    try {
      await adminService.banUser(id);
      toast.success('User banned');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleUnban = async (id) => {
    try {
      await adminService.unbanUser(id);
      toast.success('User unbanned');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleVerify = async (id) => {
    try {
      await adminService.verifyUser(id);
      toast.success('User verified');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      {/* ADDED: tab bar with pending badge */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(0); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'Pending Verification' && <HiClock className="w-4 h-4" />}
            {tab}
            {tab === 'Pending Verification' && pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white rounded-full text-xs leading-none">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visibleUsers.map((u) => (
              // ADDED: subtle highlight for rows that are pending verification
              <tr key={u.id} className={`hover:bg-gray-50 ${u.role === 'CLIENT' && !u.active && !u.banned ? 'bg-yellow-50/40' : ''}`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  {/* FIX: was u.isActive (always undefined) — now u.active. Also handles banned state. */}
                  {u.banned ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.active ? 'Active' : 'Pending Verification'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  {/* FIX: was u.isActive (always undefined) — now u.active */}
                  {u.role === 'CLIENT' && !u.active && !u.banned && (
                    <button onClick={() => handleVerify(u.id)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                      <HiCheck className="w-4 h-4" /> Verify
                    </button>
                  )}
                  {/* FIX: was u.isActive — now u.active. Also skip ban button if already banned. */}
                  {u.active && !u.banned ? (
                    <button onClick={() => handleBan(u.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-500">
                      <HiBan className="w-4 h-4" /> Ban
                    </button>
                  ) : u.banned ? (
                    <button onClick={() => handleUnban(u.id)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500">
                      <HiCheck className="w-4 h-4" /> Unban
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
    </div>
  );
}
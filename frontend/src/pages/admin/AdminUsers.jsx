import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiBan, HiCheck } from 'react-icons/hi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

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
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.banned ? (
                    <button onClick={() => handleUnban(u.id)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500">
                      <HiCheck className="w-4 h-4" /> Unban
                    </button>
                  ) : (
                    <button onClick={() => handleBan(u.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-500">
                      <HiBan className="w-4 h-4" /> Ban
                    </button>
                  )}
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

import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiBan, HiCheck, HiClock, HiIdentification } from 'react-icons/hi';

const TABS = ['All Users', 'Pending Clients', 'Pending Freelancers'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Users');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const loadUsers = () => {
    setLoading(true);
    adminService.getUsers(page, 10)
      .then(({ data }) => {
        setUsers(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));

    adminService.getPendingFreelancers(0, 100)
      .then(({ data }) => setFreelancers(data.data?.content || []))
      .catch(() => setFreelancers([]));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const pendingClients = users.filter(u => u.role === 'CLIENT' && !u.active && !u.banned);
  const pendingFreelancers = freelancers;

  const visibleUsers = activeTab === 'Pending Clients'
    ? pendingClients
    : activeTab === 'All Users'
    ? users
    : [];

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

  const handleVerifyClient = async (id) => {
    try {
      await adminService.verifyUser(id);
      toast.success('Client verified');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleVerifyFreelancer = async (id) => {
    try {
      await adminService.verifyFreelancer(id);
      toast.success('Freelancer verified');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleRejectFreelancer = async (id) => {
    try {
      await adminService.rejectFreelancer(id, rejectNote);
      toast.success('Freelancer rejected');
      setRejectingId(null);
      setRejectNote('');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      {/* Tab bar */}
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
            {tab === 'Pending Clients' && <HiClock className="w-4 h-4" />}
            {tab === 'Pending Freelancers' && <HiIdentification className="w-4 h-4" />}
            {tab}
            {tab === 'Pending Clients' && pendingClients.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white rounded-full text-xs leading-none">
                {pendingClients.length}
              </span>
            )}
            {tab === 'Pending Freelancers' && pendingFreelancers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs leading-none">
                {pendingFreelancers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── All Users / Pending Clients table ── */}
      {activeTab !== 'Pending Freelancers' && (
        <>
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
                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
                {visibleUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.role === 'CLIENT' && !u.active && !u.banned ? 'bg-yellow-50/40' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.banned ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.active ? 'Active' : 'Pending Verification'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {u.role === 'CLIENT' && !u.active && !u.banned && (
                        <button onClick={() => handleVerifyClient(u.id)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                          <HiCheck className="w-4 h-4" /> Verify
                        </button>
                      )}
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
        </>
      )}

      {/* ── Pending Freelancers tab ── */}
      {activeTab === 'Pending Freelancers' && (
        <div className="space-y-4">
          {pendingFreelancers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HiIdentification className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No pending freelancer verifications.</p>
            </div>
          ) : (
            pendingFreelancers.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {f.user?.firstName} {f.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{f.user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-medium">Aadhaar:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded tracking-widest">
                        {f.aadhaarNumber
                          ? `XXXX XXXX ${f.aadhaarNumber.slice(-4)}`
                          : 'Not provided'}
                      </span>
                    </div>
                    {f.title && f.title !== 'New Freelancer' && (
                      <p className="text-sm text-gray-600">Title: {f.title}</p>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>

                <div className="mt-4">
                  {rejectingId === f.id ? (
                    <div className="space-y-2">
                      <input
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection (optional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectFreelancer(f.id)}
                          className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectNote(''); }}
                          className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyFreelancer(f.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        <HiCheck className="w-4 h-4" /> Verify
                      </button>
                      <button
                        onClick={() => setRejectingId(f.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {f.verificationNote && (
                  <p className="mt-3 text-xs text-gray-400 italic">Note: {f.verificationNote}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
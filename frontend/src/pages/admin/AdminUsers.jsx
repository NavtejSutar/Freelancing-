import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { toast } from 'react-toastify';
import { HiCheck, HiX, HiBan, HiClock, HiIdentification } from 'react-icons/hi';

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

  const loadData = () => {
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

  useEffect(() => { loadData(); }, [page]);

  const pendingClients = users.filter(u => u.role === 'CLIENT' && !u.active && !u.banned);

  const handleVerifyClient = (id) => {
    adminService.verifyUser(id)
      .then(() => { toast.success('Client verified'); loadData(); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const handleVerifyFreelancer = (id) => {
    adminService.verifyFreelancer(id)
      .then(() => { toast.success('Freelancer verified'); loadData(); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const handleRejectFreelancer = (id) => {
    adminService.rejectFreelancer(id, rejectNote)
      .then(() => {
        toast.success('Freelancer rejected');
        setRejectingId(null);
        setRejectNote('');
        loadData();
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const handleBan = (id) => {
    adminService.banUser(id)
      .then(() => { toast.success('User banned'); loadData(); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const handleUnban = (id) => {
    adminService.unbanUser(id)
      .then(() => { toast.success('User unbanned'); loadData(); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

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
            {tab === 'Pending Freelancers' && freelancers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs leading-none">
                {freelancers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ALL USERS */}
      {activeTab === 'All Users' && (
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
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {u.role === 'CLIENT' ? u.firstName : `${u.firstName} ${u.lastName}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.banned
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>
                        : <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {u.active ? 'Active' : 'Pending'}
                          </span>
                      }
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {u.active && !u.banned && (
                        <button onClick={() => handleBan(u.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-500">
                          <HiBan className="w-4 h-4" /> Ban
                        </button>
                      )}
                      {u.banned && (
                        <button onClick={() => handleUnban(u.id)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500">
                          <HiCheck className="w-4 h-4" /> Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </>
      )}

      {/* PENDING CLIENTS */}
      {activeTab === 'Pending Clients' && (
        <div className="space-y-4">
          {pendingClients.length === 0
            ? <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No pending client verifications.</p></div>
            : pendingClients.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-lg">{u.firstName}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleVerifyClient(u.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    <HiCheck className="w-4 h-4" /> Verify
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* PENDING FREELANCERS */}
      {activeTab === 'Pending Freelancers' && (
        <div className="space-y-4">
          {freelancers.length === 0
            ? <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No pending freelancer verifications.</p></div>
            : freelancers.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-lg">{f.user?.firstName} {f.user?.lastName}</p>
                    <p className="text-sm text-gray-500">{f.user?.email}</p>
                    {f.aadhaarNumber && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">Aadhaar:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded tracking-widest">
                          XXXX XXXX {f.aadhaarNumber.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                </div>
                <div className="mt-4">
                  {rejectingId === f.id ? (
                    <div className="space-y-2">
                      <input
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection (optional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleRejectFreelancer(f.id)} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Confirm Reject</button>
                        <button onClick={() => { setRejectingId(null); setRejectNote(''); }} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
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
                        <HiX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
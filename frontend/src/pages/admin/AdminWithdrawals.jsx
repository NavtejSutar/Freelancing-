import { useEffect, useState } from 'react';
import { withdrawalService } from '../../api/withdrawalService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const load = () => {
    setLoading(true);
    withdrawalService.getPending(page, 10)
      .then(({ data }) => {
        setWithdrawals(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setWithdrawals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleApprove = async (id) => {
    try {
      await withdrawalService.approve(id);
      toast.success('Withdrawal approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await withdrawalService.reject(id, adminNote);
      toast.success('Withdrawal rejected');
      setRejectingId(null);
      setAdminNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Withdrawals</h1>

      {withdrawals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No pending withdrawals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w) => (
            <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Withdrawal #{w.id}</p>
                  <p className="text-sm text-gray-500 mt-1">Amount: ${w.amount}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={w.status} />
              </div>
              {w.status === 'PENDING' && (
                <div className="mt-4 flex gap-2 items-start">
                  <button onClick={() => handleApprove(w.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>
                  {rejectingId === w.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Rejection reason..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReject(w.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                        <button onClick={() => setRejectingId(null)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setRejectingId(w.id)} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">Reject</button>
                  )}
                </div>
              )}
            </div>
          ))}
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

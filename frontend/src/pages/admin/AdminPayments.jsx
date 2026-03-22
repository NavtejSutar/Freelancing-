import { useEffect, useState } from 'react';
import { paymentService } from '../../api/paymentService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    paymentService.getAll(page, 10)
      .then(({ data }) => {
        setPayments(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleConfirm = async (id) => {
    try {
      await paymentService.confirm(id);
      toast.success('Payment confirmed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      {payments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No payments yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UPI Txn ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{p.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{p.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">₹{p.platformFee}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                      {p.upiTransactionId
                        ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{p.upiTransactionId}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirm(p.id)}
                          className="text-sm text-green-600 hover:text-green-500 font-medium"
                        >
                          ✓ Confirm
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
    </div>
  );
}
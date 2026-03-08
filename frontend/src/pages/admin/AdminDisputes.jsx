import { useEffect, useState } from 'react';
import { disputeService } from '../../api/disputeService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolution, setResolution] = useState('');

  const loadDisputes = () => {
    setLoading(true);
    disputeService.getAll(page, 10)
      .then(({ data }) => {
        setDisputes(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDisputes(); }, [page]);

  const handleResolve = async (id) => {
    try {
      await disputeService.resolve(id, { resolution });
      toast.success('Dispute resolved');
      setResolvingId(null);
      setResolution('');
      loadDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleClose = async (id) => {
    try {
      await disputeService.close(id);
      toast.success('Dispute closed');
      loadDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>

      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No disputes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Dispute #{d.id} — Contract #{d.contractId}</p>
                  <p className="text-sm text-gray-500 mt-1">{d.reason}</p>
                  <p className="text-sm text-gray-600 mt-2">{d.description}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              {d.status === 'OPEN' && (
                <div className="mt-4 flex gap-2">
                  {resolvingId === d.id ? (
                    <div className="w-full space-y-2">
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Resolution details..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleResolve(d.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Resolve</button>
                        <button onClick={() => setResolvingId(null)} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setResolvingId(d.id)} className="text-sm text-indigo-600 hover:text-indigo-500">Resolve</button>
                      <button onClick={() => handleClose(d.id)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                    </>
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

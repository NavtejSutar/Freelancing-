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
    if (!resolution.trim()) { toast.error('Please enter a resolution'); return; }
    try {
      // FIX: was passing { resolution } as an object — service expects a plain string
      await disputeService.resolve(id, resolution.trim());
      toast.success('Dispute resolved');
      setResolvingId(null);
      setResolution('');
      loadDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this dispute without a resolution? The contract will be restored to ACTIVE.')) return;
    try {
      await disputeService.close(id);
      toast.success('Dispute closed');
      loadDisputes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close');
    }
  };

  if (loading) return <LoadingSpinner />;

  const openCount = disputes.filter(d => d.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        {openCount > 0 && (
          <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
            {openCount} open
          </span>
        )}
      </div>

      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No disputes found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                d.status === 'OPEN' ? 'border-red-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-900">Dispute #{d.id}</p>
                    <span className="text-gray-400">·</span>
                    <p className="text-sm text-gray-500">Contract #{d.contractId}</p>
                    <span className="text-gray-400">·</span>
                    <p className="text-sm text-gray-500">
                      Raised by <span className="font-medium text-gray-700">{d.initiatorName || `User #${d.initiatorId}`}</span>
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1">{d.reason}</p>
                  {d.description && (
                    <p className="text-sm text-gray-500 mt-1">{d.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(d.createdAt).toLocaleString()}
                  </p>
                  {d.resolution && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-700 uppercase mb-1">Resolution</p>
                      <p className="text-sm text-green-800">{d.resolution}</p>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <StatusBadge status={d.status} />
                </div>
              </div>

              {/* Resolve / Close actions — only shown for OPEN disputes */}
              {d.status === 'OPEN' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {resolvingId === d.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe the resolution and outcome for both parties..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(d.id)}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium"
                        >
                          Confirm Resolution
                        </button>
                        <button
                          onClick={() => { setResolvingId(null); setResolution(''); }}
                          className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setResolvingId(d.id); setResolution(''); }}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleClose(d.id)}
                        className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                      >
                        Close without resolution
                      </button>
                    </div>
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
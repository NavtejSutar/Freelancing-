import { useEffect, useState } from 'react';
import { reportService } from '../../api/reportService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const loadReports = () => {
    setLoading(true);
    reportService.getAll(page, 10)
      .then(({ data }) => {
        setReports(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [page]);

  const handleResolve = async (id) => {
    try {
      await reportService.resolve(id, adminNote);
      toast.success('Report resolved');
      setResolvingId(null);
      setAdminNote('');
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No reports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Report #{r.id}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.reason}</p>
                  <p className="text-sm text-gray-600 mt-2">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.status === 'PENDING' && (
                <div className="mt-4">
                  {resolvingId === r.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Admin note..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleResolve(r.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Resolve</button>
                        <button onClick={() => setResolvingId(null)} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setResolvingId(r.id)} className="text-sm text-indigo-600 hover:text-indigo-500">Resolve</button>
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

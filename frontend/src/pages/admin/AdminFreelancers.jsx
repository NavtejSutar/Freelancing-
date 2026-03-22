import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiCheck, HiX, HiIdentification } from 'react-icons/hi';

export default function AdminFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = () => {
    setLoading(true);
    adminService.getPendingFreelancers(page, 10)
      .then(({ data }) => {
        setFreelancers(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setFreelancers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleVerify = async (id) => {
    try {
      await adminService.verifyFreelancer(id);
      toast.success('Freelancer verified');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectFreelancer(id, rejectNote);
      toast.success('Freelancer rejected');
      setRejectingId(null);
      setRejectNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HiIdentification className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Verification</h1>
      </div>

      {freelancers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiIdentification className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No pending verifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {freelancers.map((f) => (
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
                  {f.title && (
                    <p className="text-sm text-gray-600 mt-1">Title: {f.title}</p>
                  )}
                </div>
                <StatusBadge status={f.verificationStatus} />
              </div>

              {f.verificationStatus === 'PENDING' && (
                <div className="mt-4 space-y-3">
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
                          onClick={() => handleReject(f.id)}
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
                        onClick={() => handleVerify(f.id)}
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
              )}

              {f.verificationNote && (
                <p className="mt-3 text-xs text-gray-500 italic">Note: {f.verificationNote}</p>
              )}
            </div>
          ))}
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
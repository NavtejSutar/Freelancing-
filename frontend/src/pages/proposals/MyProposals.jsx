import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { proposalService } from '../../api/proposalService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    proposalService.getMy(page, 10)
      .then(({ data }) => {
        setProposals(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>

      {proposals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No proposals yet.</p>
          <Link to="/jobs" className="mt-3 inline-block text-indigo-600 hover:text-indigo-500 font-medium">Browse jobs</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {proposals.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{p.jobPostTitle || `Job #${p.jobPostId}`}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.coverLetter}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {/* FIX: was p.bidAmount — backend field is proposedRate */}
                      <span>Bid: ₹{p.proposedRate}</span>
                      {p.estimatedDuration && <span>Duration: {p.estimatedDuration}</span>}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
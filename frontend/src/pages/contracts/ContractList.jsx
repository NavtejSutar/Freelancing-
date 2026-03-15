import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contractService } from '../../api/contractService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    contractService.getAll(page, 10)
      .then(({ data }) => {
        setContracts(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No contracts yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {contracts.map((c) => (
              <Link key={c.id} to={`/contracts/${c.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Contract #{c.id}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Total: ₹{c.totalAmount}</span>
                      <span>Milestones: {c.milestones?.length || 0}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
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
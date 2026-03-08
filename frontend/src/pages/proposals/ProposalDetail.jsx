import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalService } from '../../api/proposalService';
import { contractService } from '../../api/contractService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function ProposalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    proposalService.getById(id)
      .then(({ data }) => setProposal(data.data))
      .catch(() => toast.error('Proposal not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action) => {
    setActing(true);
    try {
      if (action === 'accept') {
        await proposalService.accept(id);
        toast.success('Proposal accepted!');
      } else if (action === 'reject') {
        await proposalService.reject(id);
        toast.success('Proposal rejected');
      } else if (action === 'withdraw') {
        await proposalService.withdraw(id);
        toast.success('Proposal withdrawn');
      } else if (action === 'contract') {
        await contractService.createFromProposal(id);
        toast.success('Contract created!');
        navigate('/contracts');
        return;
      }
      const { data } = await proposalService.getById(id);
      setProposal(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!proposal) return <div className="text-center py-12 text-gray-500">Proposal not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proposal Details</h1>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Bid Amount</p>
            <p className="text-xl font-bold text-gray-900">${proposal.bidAmount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-xl font-bold text-gray-900">{proposal.estimatedDuration || 'Not specified'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h2>
          <p className="text-gray-700 whitespace-pre-line">{proposal.coverLetter}</p>
        </div>

        <div className="mt-6 flex gap-3">
          {user?.role === 'CLIENT' && proposal.status === 'PENDING' && (
            <>
              <button onClick={() => handleAction('accept')} disabled={acting} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                Accept
              </button>
              <button onClick={() => handleAction('reject')} disabled={acting} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50">
                Reject
              </button>
            </>
          )}
          {user?.role === 'CLIENT' && proposal.status === 'ACCEPTED' && (
            <button onClick={() => handleAction('contract')} disabled={acting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              Create Contract
            </button>
          )}
          {user?.role === 'FREELANCER' && proposal.status === 'PENDING' && (
            <button onClick={() => handleAction('withdraw')} disabled={acting} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { proposalService } from '../../api/proposalService';
import { contractService } from '../../api/contractService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiArrowLeft } from 'react-icons/hi';

export default function ProposalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const reload = () =>
    proposalService.getById(id)
      .then(({ data }) => setProposal(data.data))
      .catch(() => toast.error('Proposal not found'))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, [id]);

  const handleAccept = async () => {
    setActing(true);
    try {
      await proposalService.accept(id);
      toast.success('Proposal accepted! Creating contract...');
      // Immediately create the contract — client auto-accepts it
      const { data } = await contractService.createFromProposal(id);
      const contractId = data.data?.id;
      toast.success('Contract created — waiting for freelancer to accept');
      navigate(`/contracts/${contractId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept proposal');
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await proposalService.reject(id);
      toast.success('Proposal rejected');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setActing(false);
    }
  };

  const handleWithdraw = async () => {
    setActing(true);
    try {
      await proposalService.withdraw(id);
      toast.success('Proposal withdrawn');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!proposal) return <div className="text-center py-12 text-gray-500">Proposal not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={proposal.jobPostId ? `/jobs/${proposal.jobPostId}` : '/jobs'} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <HiArrowLeft className="w-4 h-4" /> Back to job
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposal</h1>
            {proposal.jobPostTitle && (
              <p className="text-sm text-gray-500 mt-0.5">For: <span className="font-medium text-gray-700">{proposal.jobPostTitle}</span></p>
            )}
            {proposal.freelancerName && (
              <p className="text-sm text-gray-500">By: <span className="font-medium text-gray-700">{proposal.freelancerName}</span></p>
            )}
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Proposed Rate</p>
            {/* FIX: was p.bidAmount — the field from backend is proposedRate */}
            <p className="text-xl font-bold text-gray-900">₹${proposal.proposedRate}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Estimated Duration</p>
            <p className="text-xl font-bold text-gray-900">{proposal.estimatedDuration || 'Not specified'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h2>
          <p className="text-gray-700 whitespace-pre-line">{proposal.coverLetter}</p>
          {proposal.coverLetterPdfUrl && (
            <a
              href={proposal.coverLetterPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              📄 View Cover Letter PDF
            </a>
          )}
        </div>

        <div className="mt-6 flex gap-3 flex-wrap">
          {/* CLIENT actions */}
          {user?.role === 'CLIENT' && proposal.status === 'PENDING' && (
            <>
              <button
                onClick={handleAccept}
                disabled={acting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {acting ? 'Processing...' : 'Accept & Create Contract'}
              </button>
              <button
                onClick={handleReject}
                disabled={acting}
                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}

          {/* FREELANCER actions */}
          {user?.role === 'FREELANCER' && proposal.status === 'PENDING' && (
            <button
              onClick={handleWithdraw}
              disabled={acting}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Withdraw Proposal
            </button>
          )}

          {proposal.status === 'ACCEPTED' && (
            <p className="text-sm text-green-600 font-medium bg-green-50 px-4 py-2.5 rounded-lg">
              ✓ Proposal accepted — contract has been created
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
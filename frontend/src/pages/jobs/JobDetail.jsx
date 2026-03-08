import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../api/jobService';
import { proposalService } from '../../api/proposalService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiCurrencyDollar, HiBriefcase, HiClock, HiUserGroup } from 'react-icons/hi';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: '', bidAmount: '', estimatedDuration: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    jobService.getById(id)
      .then(({ data }) => setJob(data.data))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

    if (user?.role === 'CLIENT') {
      proposalService.getByJob(id, 0, 50)
        .then(({ data }) => setProposals(data.data?.content || []))
        .catch(() => {});
    }
  }, [id, user]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await proposalService.create({ ...proposalData, jobPostId: parseInt(id), bidAmount: parseFloat(proposalData.bidAmount) });
      toast.success('Proposal submitted!');
      setShowProposalForm(false);
      setProposalData({ coverLetter: '', bidAmount: '', estimatedDuration: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await jobService.delete(id);
      toast.success('Job deleted');
      navigate('/jobs/my');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: HiCurrencyDollar, label: 'Budget', value: `$${job.budgetMin} - $${job.budgetMax}` },
            { icon: HiBriefcase, label: 'Type', value: job.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly' },
            { icon: HiClock, label: 'Duration', value: job.expectedDuration || 'Not specified' },
            { icon: HiUserGroup, label: 'Experience', value: job.experienceLevel?.replace(/_/g, ' ') || 'Any' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <item.icon className="w-5 h-5 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill.id || skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {user?.role === 'FREELANCER' && job.status === 'OPEN' && (
            <button
              onClick={() => setShowProposalForm(!showProposalForm)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showProposalForm ? 'Cancel' : 'Submit Proposal'}
            </button>
          )}
          {user?.role === 'CLIENT' && (
            <>
              <Link to={`/jobs/${id}/edit`} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Edit
              </Link>
              <button onClick={handleDeleteJob} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showProposalForm && (
        <form onSubmit={handleSubmitProposal} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Submit Your Proposal</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
            <textarea
              value={proposalData.coverLetter}
              onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
              rows={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Explain why you're the best fit for this project..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
              <input
                type="number"
                value={proposalData.bidAmount}
                onChange={(e) => setProposalData(prev => ({ ...prev, bidAmount: e.target.value }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
              <input
                value={proposalData.estimatedDuration}
                onChange={(e) => setProposalData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="e.g. 2 weeks"
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </form>
      )}

      {user?.role === 'CLIENT' && proposals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposals ({proposals.length})</h2>
          <div className="space-y-3">
            {proposals.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="block p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{p.freelancerName || 'Freelancer'}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.coverLetter}</p>
                    <p className="text-sm font-medium text-indigo-600 mt-1">${p.bidAmount}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

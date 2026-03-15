import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { proposalService } from '../../api/proposalService';
import { contractService } from '../../api/contractService';
import { jobService } from '../../api/jobService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiBriefcase, HiDocumentText, HiClipboardList, HiCurrencyDollar } from 'react-icons/hi';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      proposalService.getMy(0, 5).catch(() => ({ data: { data: { content: [] } } })),
      contractService.getAll(0, 5).catch(() => ({ data: { data: { content: [] } } })),
      jobService.getAll(0, 5).catch(() => ({ data: { data: { content: [] } } })),
    ]).then(([propRes, contRes, jobRes]) => {
      setProposals(propRes.data.data?.content || []);
      setContracts(contRes.data.data?.content || []);
      setRecentJobs(jobRes.data.data?.content || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const pendingProposals = proposals.filter(p => p.status === 'PENDING').length;

  // Also show contracts pending freelancer acceptance
  const pendingContracts = contracts.filter(c => c.status === 'PENDING_ACCEPTANCE' && !c.freelancerAccepted);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>

      {/* Alert for contracts awaiting freelancer acceptance */}
      {pendingContracts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ You have {pendingContracts.length} contract{pendingContracts.length > 1 ? 's' : ''} waiting for your acceptance.
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {pendingContracts.map(c => (
              <Link key={c.id} to={`/contracts/${c.id}`} className="text-sm text-indigo-600 underline hover:text-indigo-800">
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Contracts', value: activeContracts, icon: HiClipboardList, color: 'text-green-600 bg-green-100' },
          { label: 'Pending Proposals', value: pendingProposals, icon: HiDocumentText, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Total Proposals', value: proposals.length, icon: HiDocumentText, color: 'text-blue-600 bg-blue-100' },
          { label: 'Total Contracts', value: contracts.length, icon: HiCurrencyDollar, color: 'text-indigo-600 bg-indigo-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/jobs" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No jobs available.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">₹{job.budgetMin} - ₹{job.budgetMax}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Proposals</h2>
            <Link to="/proposals/my" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-sm">No proposals yet.</p>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <Link key={p.id} to={`/proposals/${p.id}`} className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{p.jobPostTitle || `Job #${p.jobPostId}`}</p>
                      {/* FIX: was p.bidAmount — backend field is proposedRate */}
                      <p className="text-sm text-gray-500 mt-0.5">₹{p.proposedRate}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
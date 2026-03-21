import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../api/jobService';
import { contractService } from '../../api/contractService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiBriefcase, HiClipboardList, HiCurrencyDollar, HiPlus } from 'react-icons/hi';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobService.getMyJobs(0, 5).catch(() => ({ data: { data: { content: [] } } })),
      contractService.getAll(0, 5).catch(() => ({ data: { data: { content: [] } } })),
    ]).then(([jobRes, contRes]) => {
      setJobs(jobRes.data.data?.content || []);
      setContracts(contRes.data.data?.content || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const openJobs = jobs.filter(j => j.status === 'OPEN').length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;

  // Contracts where client hasn't signed yet
  const pendingSignature = contracts.filter(c => c.status === 'PENDING_ACCEPTANCE' && !c.clientAccepted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <Link
          to="/jobs/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <HiPlus className="w-5 h-5" /> Post a Job
        </Link>
      </div>

      {/* Alert: contracts waiting for client to sign */}
      {pendingSignature.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ You have {pendingSignature.length} contract{pendingSignature.length > 1 ? 's' : ''} waiting for your signature.
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {pendingSignature.map(c => (
              <Link key={c.id} to={`/contracts/${c.id}`} className="text-sm text-indigo-600 underline hover:text-indigo-800">
                {c.title || `Contract #${c.id}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Open Jobs', value: openJobs, icon: HiBriefcase, color: 'text-green-600 bg-green-100' },
          { label: 'Active Contracts', value: activeContracts, icon: HiClipboardList, color: 'text-blue-600 bg-blue-100' },
          { label: 'Total Jobs', value: jobs.length, icon: HiCurrencyDollar, color: 'text-indigo-600 bg-indigo-100' },
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
            <h2 className="text-lg font-semibold text-gray-900">My Jobs</h2>
            <Link to="/jobs/my" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No jobs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{job.proposalCount || 0} proposals</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Active Contracts</h2>
            <Link to="/contracts" className="text-sm text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          {contracts.length === 0 ? (
            <p className="text-gray-500 text-sm">No contracts yet.</p>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <Link key={c.id} to={`/contracts/${c.id}`} className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{c.title || `Contract #${c.id}`}</p>
                      {/* FIX: was "₹${c.totalAmount}" — stray $ removed */}
                      <p className="text-sm text-gray-500 mt-0.5">₹{c.totalAmount}</p>
                    </div>
                    <StatusBadge status={c.status} />
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
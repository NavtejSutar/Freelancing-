import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../api/jobService';
import { contractService } from '../../api/contractService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiPlus } from 'react-icons/hi';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobService.getMyJobs(0, 50),
      contractService.getAll(0, 50).catch(() => ({ data: { data: { content: [] } } })),
    ])
      .then(([jobsRes, contRes]) => {
        setJobs(jobsRes.data.data?.content || []);
        setContracts(contRes.data.data?.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Build a map of jobPostId → contract for quick lookup
  const contractByJobId = {};
  contracts.forEach(c => {
    if (c.jobPostId) contractByJobId[c.jobPostId] = c;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link to="/jobs/create" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <HiPlus className="w-5 h-5" /> Post Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">You haven&apos;t posted any jobs yet.</p>
          <Link to="/jobs/create" className="mt-3 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const contract = contractByJobId[job.id];
            return (
              <Link
                key={job.id}
                to={contract ? `/contracts/${contract.id}` : `/jobs/${job.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{job.budgetMin} – ₹{job.budgetMax} &middot; {job.proposalCount || 0} proposals
                    </p>

                    {/* Show contract info if one exists for this job */}
                    {contract && (
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span>Contract</span>
                          <StatusBadge status={contract.status} />
                        </div>
                        {contract.freelancerName && (
                          <span className="text-xs text-gray-500">
                            Freelancer: <span className="font-medium text-gray-700">{contract.freelancerName}</span>
                          </span>
                        )}
                        {contract.paymentStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            contract.paymentStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            Payment: {contract.paymentStatus === 'COMPLETED' ? 'Confirmed' : 'Pending'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    <StatusBadge status={job.status} />
                    {contract && (
                      <span className="text-xs text-indigo-600 font-medium">View Contract →</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
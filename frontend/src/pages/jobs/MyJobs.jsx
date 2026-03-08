import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../api/jobService';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiPlus } from 'react-icons/hi';

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getAll(0, 50)
      .then(({ data }) => setJobs(data.data?.content || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

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
          <Link to="/jobs/create" className="mt-3 inline-block text-indigo-600 hover:text-indigo-500 font-medium">Post your first job</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">${job.budgetMin} - ${job.budgetMax} &middot; {job.proposalCount || 0} proposals</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

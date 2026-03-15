import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobService } from '../../api/jobService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiSearch, HiFilter } from 'react-icons/hi';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const page = parseInt(searchParams.get('page') || '0');

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 10, status: 'OPEN' };
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword');

    jobService.search(params)
      .then(({ data }) => {
        setJobs(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(keyword ? { keyword, page: 0 } : { page: 0 });
  };

  const handlePageChange = (p) => {
    const params = Object.fromEntries(searchParams);
    params.page = p;
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search jobs by title, description, or skills..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills?.map((skill) => (
                      <span key={skill.id || skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{job.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly'}</span>
                    <span>₹{job.budgetMin} - ₹{job.budgetMax}</span>
                    <span>{job.experienceLevel?.replace(/_/g, ' ')}</span>
                    <span>{job.proposalCount || 0} proposals</span>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            </Link>
          ))}
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
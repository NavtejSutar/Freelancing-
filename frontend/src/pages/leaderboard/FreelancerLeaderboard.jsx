import { useEffect, useState } from 'react';
import { HiStar, HiUserCircle } from 'react-icons/hi';
import { FaTrophy } from 'react-icons/fa';
import { freelancerService } from '../../api/freelancerService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

export default function FreelancerLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data } = await freelancerService.getAll(0, 100, ['avgRating,desc', 'totalReviews,desc']);
        const items = data?.data?.content || data?.data || [];
        setFreelancers(items.filter((f) => (f?.totalReviews || 0) > 0));
      } catch {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="w-8 h-8 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Freelancer Leaderboard</h1>
            <p className="text-sm text-gray-600">Ranked by client ratings on completed contracts (out of 10)</p>
          </div>
        </div>
      </div>

      {freelancers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No rated freelancers yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Freelancer</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-2 text-right">Reviews</div>
          </div>

          {freelancers.map((f, index) => (
            <div key={f.id} className="grid grid-cols-12 items-center px-4 py-4 border-b border-gray-100 last:border-b-0">
              <div className="col-span-2">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {index + 1}
                </span>
              </div>

              <div className="col-span-6 flex items-center gap-3">
                <HiUserCircle className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {f?.user ? `${f.user.firstName || ''} ${f.user.lastName || ''}`.trim() : f?.title || 'Freelancer'}
                  </p>
                  <p className="text-xs text-gray-500">{f?.title || 'No title set'}</p>
                </div>
              </div>

              <div className="col-span-2 text-right font-semibold text-gray-900 inline-flex items-center justify-end gap-1">
                <HiStar className="w-4 h-4 text-yellow-500" />
                {(f?.avgRating || 0).toFixed(1)}/10
              </div>

              <div className="col-span-2 text-right text-gray-700">
                {f?.totalReviews || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
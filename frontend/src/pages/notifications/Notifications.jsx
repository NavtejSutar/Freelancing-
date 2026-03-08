import { useEffect, useState } from 'react';
import { notificationService } from '../../api/notificationService';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiBell, HiCheck, HiTrash } from 'react-icons/hi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationService.getAll(page, 15)
      .then(({ data }) => {
        setNotifications(data.data?.content || []);
        setTotalPages(data.data?.totalPages || 0);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      load();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All marked as read');
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      load();
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-indigo-600 hover:text-indigo-500">Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiBell className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">No notifications.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 flex items-start gap-3 ${n.read ? 'opacity-60' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-gray-300' : 'bg-indigo-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{n.title || n.message}</p>
                  {n.message && n.title && <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="p-1 text-gray-400 hover:text-green-600" title="Mark as read">
                      <HiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

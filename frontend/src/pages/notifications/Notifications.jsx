import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../api/notificationService';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiBell, HiCheck, HiTrash, HiExternalLink } from 'react-icons/hi';

const getLink = (n) => {
  if (!n.referenceId || !n.referenceType) return null;
  const t = String(n.referenceType).toUpperCase();
  if (t === 'CONTRACT') return `/contracts/${n.referenceId}`;
  if (t === 'PROPOSAL') return `/proposals/${n.referenceId}`;
  if (t === 'JOB' || t === 'JOB_POST') return `/jobs/${n.referenceId}`;
  if (t === 'MESSAGE' || t === 'MESSAGE_THREAD') return `/messages/${n.referenceId}`;
  return null;
};

const typeBadge = (type) => {
  if (!type) return 'bg-gray-100 text-gray-600';
  const t = String(type).toUpperCase();
  if (t.includes('PROPOSAL')) return 'bg-blue-100 text-blue-700';
  if (t.includes('CONTRACT')) return 'bg-indigo-100 text-indigo-700';
  if (t.includes('PAYMENT')) return 'bg-green-100 text-green-700';
  if (t.includes('DISPUTE')) return 'bg-red-100 text-red-700';
  if (t.includes('MESSAGE')) return 'bg-purple-100 text-purple-700';
  if (t.includes('MILESTONE')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

export default function Notifications() {
  const navigate = useNavigate();
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
      // FIX: backend entity field is "isRead" but Lombok/Jackson serializes boolean
      // getter isRead() as JSON key "read" (strips the "is" prefix).
      // So we must write n.read (not n.isRead) to check read state.
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleClick = async (n) => {
    // FIX: use n.read (not n.isRead) — see comment in handleMarkRead above
    if (!n.read) await handleMarkRead(n.id);
    const link = getLink(n);
    if (link) navigate(link);
  };

  if (loading) return <LoadingSpinner />;

  // FIX: use n.read (not n.isRead)
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiBell className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">You're all caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No notifications at the moment.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {notifications.map((n) => {
              const link = getLink(n);
              const isClickable = !!link;
              // FIX: use n.read — Lombok strips "is" prefix from boolean getters in JSON
              const isUnread = !n.read;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors ${
                    isUnread ? 'bg-indigo-50/40' : ''
                  } ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={isClickable ? () => handleClick(n) : undefined}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isUnread ? 'bg-indigo-600' : 'bg-gray-200'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.type && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(n.type)}`}>
                          {String(n.type).replace(/_/g, ' ')}
                        </span>
                      )}
                      {isClickable && <HiExternalLink className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    {n.title && (
                      <p className={`text-sm mt-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                    )}
                    {n.content && <p className="text-sm text-gray-500 mt-0.5">{n.content}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isUnread && (
                      <button onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as read">
                        <HiCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../../api/messageService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiChat } from 'react-icons/hi';

export default function MessageThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageService.getThreads()
      .then(({ data }) => setThreads(data.data || []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiChat className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-2">No conversations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {threads.map((thread) => (
            <Link key={thread.id} to={`/messages/${thread.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {thread.participants?.[0]?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900 truncate">
                      {thread.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'Chat'}
                    </p>
                    {thread.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{thread.lastMessage?.content || 'No messages yet'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

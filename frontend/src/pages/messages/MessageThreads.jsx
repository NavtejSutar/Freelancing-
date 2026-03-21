import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../../api/messageService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiChat, HiPlus } from 'react-icons/hi';

export default function MessageThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newParticipantId, setNewParticipantId] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    messageService.getThreads()
      .then(({ data }) => {
        // backend returns Page — handle both Page and plain list
        const content = data.data?.content || data.data || [];
        setThreads(content);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newParticipantId.trim()) return;
    setCreating(true);
    try {
      const participantId = parseInt(newParticipantId.trim());
      const { data } = await messageService.createThread({
        subject: newSubject.trim() || 'New conversation',
        participantIds: [participantId],
      });
      setShowNewThread(false);
      setNewSubject('');
      setNewParticipantId('');
      // navigate directly into the new thread
      window.location.href = `/messages/${data.data.id}`;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  // Get the other participant's name (not the current user)
  const getOtherName = (thread) => {
    if (!thread.participants) return 'Unknown';
    const others = [...thread.participants].filter(p => p.id !== user?.id);
    if (others.length === 0) return 'You';
    return others.map(p => `${p.firstName} ${p.lastName}`).join(', ');
  };

  const getInitials = (thread) => {
    const name = getOtherName(thread);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <HiPlus className="w-4 h-4" /> New Message
        </button>
      </div>

      {/* New thread form */}
      {showNewThread && (
        <form onSubmit={handleCreateThread} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Start a New Conversation</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
            <input
              type="number"
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
              placeholder="Enter the other user's ID"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">You can find a user's ID from their profile or contract page.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Question about your proposal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Start Conversation'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewThread(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiChat className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start a conversation by clicking "New Message"</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/messages/${thread.id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 font-semibold text-sm">{getInitials(thread)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900 truncate">{getOtherName(thread)}</p>
                  {thread.lastMessageAt && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(thread.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {thread.subject && (
                  <p className="text-xs text-indigo-600 font-medium truncate">{thread.subject}</p>
                )}
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {thread.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
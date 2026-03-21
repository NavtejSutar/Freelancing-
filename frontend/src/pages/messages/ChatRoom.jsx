import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageService } from '../../api/messageService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HiPaperAirplane, HiArrowLeft, HiTrash } from 'react-icons/hi';

export default function ChatRoom() {
  const { threadId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastCountRef = useRef(0);

  const getOtherName = (t) => {
    if (!t?.participants) return 'Conversation';
    const others = [...t.participants].filter(p => p.id !== user?.id);
    if (others.length === 0) return 'You';
    return others.map(p => `${p.firstName} ${p.lastName}`).join(', ');
  };

  const loadMessages = useCallback(() => {
    messageService.getMessages(threadId, 0, 100)
      .then(({ data }) => {
        // Page response — reverse so oldest is at top
        const items = data.data?.content
          ? [...data.data.content].reverse()
          : (data.data || []);
        setMessages(items);
        // Auto-scroll only when new messages arrive
        if (items.length !== lastCountRef.current) {
          lastCountRef.current = items.length;
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .catch(() => {});
  }, [threadId]);

  useEffect(() => {
    // Load thread info
    messageService.getThreadById ? null : null; // defensive
    setLoading(true);
    Promise.all([
      messageService.getMessages(threadId, 0, 100),
    ]).then(([msgRes]) => {
      const items = msgRes.data.data?.content
        ? [...msgRes.data.data.content].reverse()
        : (msgRes.data.data || []);
      setMessages(items);
      lastCountRef.current = items.length;
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).catch(() => {})
      .finally(() => setLoading(false));

    // Poll every 5 seconds for new messages
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [threadId, loadMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    const text = content.trim();
    setContent('');
    try {
      await messageService.sendMessage(threadId, { content: text });
      loadMessages();
    } catch {
      setContent(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await messageService.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch {
      alert('Failed to delete message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-gray-200 border-b px-4 py-3 flex items-center gap-3">
        <Link to="/messages" className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100">
          <HiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-xs">
            {(thread ? getOtherName(thread) : 'C').slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {thread ? getOtherName(thread) : 'Conversation'}
          </p>
          {thread?.subject && (
            <p className="text-xs text-gray-400 truncate">{thread.subject}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white border-x border-gray-200 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <span className="text-gray-600 font-semibold text-xs">
                      {(msg.senderName || 'U').slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && msg.senderName && (
                    <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>
                  )}
                  <div className={`relative px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.sentAt
                        ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                    </p>
                  </div>
                  {isMe && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="mt-1 mr-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity self-end"
                      title="Delete message"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white rounded-b-xl border border-gray-200 border-t px-4 py-3"
      >
        <div className="flex gap-2 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <HiPaperAirplane className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </form>
    </div>
  );
}
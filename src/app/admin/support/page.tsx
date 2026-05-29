'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, RefreshCw, ChevronDown, ChevronUp, CheckCheck, X } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  OPEN:        'bg-red-50 text-red-700 border border-red-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
  RESOLVED:    'bg-green-50 text-green-700 border border-green-200',
  CLOSED:      'bg-stone-100 text-stone-500 border border-stone-200',
};

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
type Filter = typeof FILTERS[number];

export default function AdminSupportPage() {
  const [tickets, setTickets]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending]     = useState<string | null>(null);
  const [closing, setClosing]     = useState<string | null>(null);
  const [filter, setFilter]       = useState<Filter>('OPEN');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch('/api/admin?type=support', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const sendReply = async (ticketId: string) => {
    const reply = replyText[ticketId]?.trim();
    if (!reply) return;
    setSending(ticketId);
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ action: 'reply-support', id: ticketId, reply }),
      });
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, adminReply: reply, status: 'IN_PROGRESS' } : t
      ));
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    } catch { /* silent */ }
    finally { setSending(null); }
  };

  const updateStatus = async (ticketId: string, action: 'resolve-support' | 'close-support') => {
    setClosing(ticketId);
    const token     = localStorage.getItem('token');
    const newStatus = action === 'close-support' ? 'CLOSED' : 'RESOLVED';
    try {
      await fetch('/api/admin', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ action, id: ticketId }),
      });
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
      // Collapse the ticket after closing/resolving
      setExpanded(prev => (prev === ticketId ? null : prev));
    } catch { /* silent */ }
    finally { setClosing(null); }
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  const count = (f: string) => tickets.filter(t => t.status === f).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="heading-1">Support Tickets</h1>
          <p className="text-stone-400 text-sm mt-1">
            {count('OPEN')} open · {count('IN_PROGRESS')} in progress
          </p>
        </div>
        <button onClick={fetchTickets} className="btn-secondary flex items-center gap-2 py-2 px-3.5 text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {f.replace('_', ' ')}
            {f !== 'ALL' && <span className="ml-1 opacity-70">({count(f)})</span>}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading tickets…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          No {filter !== 'ALL' ? filter.toLowerCase().replace('_', ' ') : ''} tickets
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
            const isClosed   = ticket.status === 'CLOSED';
            const isResolved = ticket.status === 'RESOLVED';
            const isDone     = isClosed || isResolved;
            const isExpanded = expanded === ticket.id;

            return (
              <div key={ticket.id} className={`card-premium transition-opacity ${isClosed ? 'opacity-60' : ''}`}>

                {/* Ticket header — click to expand */}
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-stone-900 text-sm">{ticket.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {ticket.user?.name} · {ticket.user?.phone}
                    </p>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-stone-400 ml-3 flex-shrink-0 mt-0.5">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="mt-4 space-y-3">

                    {/* Guest message */}
                    <div className="bg-stone-50 rounded-lg p-3.5">
                      <div className="text-xs text-stone-400 mb-1.5 flex items-center gap-1">
                        <MessageSquare size={11} /> Guest Message
                      </div>
                      <p className="text-xs text-stone-600 whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    {/* Previous admin reply */}
                    {ticket.adminReply && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3.5">
                        <div className="text-xs text-amber-700 mb-1.5 font-semibold">Your Reply</div>
                        <p className="text-xs text-stone-600 whitespace-pre-wrap">{ticket.adminReply}</p>
                      </div>
                    )}

                    {/* Reply box — hidden when done */}
                    {!isDone && (
                      <div>
                        <textarea
                          value={replyText[ticket.id] || ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Type your reply to the guest…"
                          rows={3}
                          className="input-field resize-none mb-2"
                        />
                        <button
                          onClick={() => sendReply(ticket.id)}
                          disabled={!replyText[ticket.id]?.trim() || sending === ticket.id}
                          className="btn-primary flex items-center gap-2 text-xs py-2 disabled:opacity-50"
                        >
                          <Send size={12} />
                          {sending === ticket.id ? 'Sending…' : 'Send Reply'}
                        </button>
                      </div>
                    )}

                    {/* Status action buttons */}
                    {!isDone && (
                      <div className="flex gap-2 pt-1 border-t border-stone-100">
                        {ticket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => updateStatus(ticket.id, 'resolve-support')}
                            disabled={closing === ticket.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                       bg-green-50 text-green-700 border border-green-200
                                       hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCheck size={13} />
                            {closing === ticket.id ? 'Updating…' : 'Mark Resolved'}
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(ticket.id, 'close-support')}
                          disabled={closing === ticket.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                     bg-stone-100 text-stone-600 border border-stone-200
                                     hover:bg-stone-200 transition-colors disabled:opacity-50"
                        >
                          <X size={13} />
                          {closing === ticket.id ? 'Closing…' : 'Close Ticket'}
                        </button>
                      </div>
                    )}

                    {/* Already done banner */}
                    {isDone && (
                      <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
                        isClosed ? 'bg-stone-50 text-stone-500 border-stone-200' : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {isClosed ? <X size={12} /> : <CheckCheck size={12} />}
                        This ticket is {isClosed ? 'closed' : 'resolved'} — no further action needed
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED: 'bg-green-50 text-green-700',
  CLOSED: 'bg-stone-100 text-stone-500',
};

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchTickets(token);
  }, [router]);

  const fetchTickets = async (token: string) => {
    try {
      const res = await fetch('/api/support', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');
      setSuccess(true);
      setForm({ subject: '', message: '' });
      setTickets(prev => [data.ticket, ...prev]);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 transition-colors">
            <ChevronLeft size={18} />
            <span className="font-playfair text-lg font-bold text-stone-900">Sweet Nest</span>
          </Link>
          <span className="text-stone-400 text-sm">Support Center</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="p-2 bg-amber-50 rounded-lg">
            <MessageSquare size={22} className="text-amber-700" />
          </div>
          <div>
            <h1 className="heading-1">Contact Support</h1>
            <p className="text-stone-400 text-xs mt-0.5">We typically reply within 24 hours</p>
          </div>
        </div>

        {/* New Ticket Form */}
        <div className="card-premium mb-7">
          <h2 className="font-playfair text-base font-bold text-stone-900 mb-4">Submit a New Request</h2>

          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm mb-4">
              <CheckCircle size={16} />
              Your request has been submitted. We&apos;ll get back to you soon!
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-700">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g., Issue with booking, Payment query..."
                maxLength={200}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-700">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe your issue or question in detail..."
                rows={4}
                maxLength={2000}
                className="input-field resize-none"
              />
              <p className="text-xs text-stone-300 mt-1">{form.message.length}/2000</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Previous Tickets */}
        <div>
          <h2 className="font-playfair text-xl font-bold text-stone-900 mb-4">Your Previous Requests</h2>

          {loading ? (
            <div className="text-center py-8 text-stone-400 text-sm">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">No support requests yet</div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm">{ticket.subject}</h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3 line-clamp-2">{ticket.message}</p>
                  {ticket.adminReply && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-xs text-amber-700 font-semibold mb-1">Support Response:</p>
                      <p className="text-xs text-stone-600 whitespace-pre-wrap">{ticket.adminReply}</p>
                      {ticket.repliedAt && (
                        <p className="text-xs text-stone-400 mt-1">
                          Replied: {new Date(ticket.repliedAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-stone-100 text-stone-500',
  SUBMITTED: 'bg-blue-50 text-blue-700',
  VERIFIED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('SUBMITTED');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchKYCs(); }, []);

  const fetchKYCs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin?type=kyc', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setKycs(data.kycs);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const approve = async (id: string) => {
    setProcessing(id);
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'approve-kyc', id }),
      });
      setKycs(prev => prev.map(k => k.id === id ? { ...k, verificationStatus: 'VERIFIED' } : k));
    } catch { /* silent */ }
    finally { setProcessing(null); }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject-kyc', id: rejectModal.id, reason: rejectReason }),
      });
      setKycs(prev => prev.map(k => k.id === rejectModal.id ? { ...k, verificationStatus: 'REJECTED', rejectionReason: rejectReason } : k));
    } catch { /* silent */ }
    finally {
      setProcessing(null);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const filtered = filter === 'ALL' ? kycs : kycs.filter(k => k.verificationStatus === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="heading-1">KYC Review</h1>
          <p className="text-stone-400 text-sm mt-1">
            {kycs.filter(k => k.verificationStatus === 'SUBMITTED').length} pending review
          </p>
        </div>
        <button onClick={fetchKYCs} className="btn-secondary flex items-center gap-2 py-2 px-3.5 text-xs">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['ALL', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {f} {f !== 'ALL' && `(${kycs.filter(k => k.verificationStatus === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading KYC records...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} KYC records</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(kyc => (
            <div key={kyc.id} className="card-premium">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-stone-900 text-sm">{kyc.user?.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{kyc.user?.phone}</p>
                  <p className="text-xs text-stone-300 mt-1">
                    Submitted: {new Date(kyc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[kyc.verificationStatus]}`}>
                  {kyc.verificationStatus}
                </span>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: 'Aadhaar', url: kyc.aadharUrl, required: true },
                  { label: 'PAN', url: kyc.panUrl, required: true },
                  { label: 'Passport', url: kyc.passportUrl, required: false },
                  { label: 'Driving Licence', url: kyc.drivingLicenseUrl, required: false },
                ].map(doc => (
                  <div
                    key={doc.label}
                    className={`p-3 rounded-lg text-center text-xs ${
                      doc.url ? 'bg-green-50 border border-green-100' : 'bg-stone-50 border border-stone-100'
                    }`}
                  >
                    <div className={`font-semibold mb-1.5 ${doc.url ? 'text-green-700' : 'text-stone-400'}`}>
                      {doc.label} {doc.required && <span className="text-red-500">*</span>}
                    </div>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                        <ExternalLink size={11} /> View
                      </a>
                    ) : (
                      <span className="text-stone-300">Not uploaded</span>
                    )}
                  </div>
                ))}
              </div>

              {kyc.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded p-2 text-xs text-red-700 mb-3">
                  Rejection reason: {kyc.rejectionReason}
                </div>
              )}

              {kyc.verificationStatus === 'SUBMITTED' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approve(kyc.id)}
                    disabled={processing === kyc.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve KYC
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: kyc.id, name: kyc.user?.name })}
                    disabled={processing === kyc.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject KYC
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="card-premium max-w-md w-full">
            <h3 className="heading-2 text-base mb-2">Reject KYC</h3>
            <p className="text-stone-500 text-sm mb-4">
              Rejecting KYC for <span className="text-stone-900 font-semibold">{rejectModal.name}</span>. Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Rejection reason (e.g., Document unclear, ID expired...)"
              rows={3}
              className="input-field resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={reject} disabled={!rejectReason.trim()} className="btn-primary flex-1 disabled:opacity-50">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

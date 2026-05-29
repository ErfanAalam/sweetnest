'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, AlertCircle, CheckCircle, FileText, ShieldCheck, Info, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const DOCUMENT_TYPES = [
  { id: 'aadhar',         name: 'Aadhaar Card',    key: 'aadharUrl',          required: true,  desc: 'Government-issued resident identity card' },
  { id: 'pan',            name: 'PAN Card',         key: 'panUrl',             required: true,  desc: 'Permanent Account Number card' },
  { id: 'passport',       name: 'Passport',         key: 'passportUrl',        required: false, desc: 'First two pages of international passport' },
  { id: 'drivingLicense', name: 'Driving Licence',  key: 'drivingLicenseUrl',  required: false, desc: 'Official regional transport licence' },
] as const;

export function KYCForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const bookingId   = searchParams.get('bookingId'); // optional — if coming from booking flow

  const [documents, setDocuments]     = useState<Record<string, string>>({});
  const [uploading, setUploading]     = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({}); // key → filename
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); }
  }, [router]);

  const handleFileUpload = async (key: string, file: File) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [key]: true }));
    setError('');

    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', key);

      const res  = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setDocuments(prev  => ({ ...prev, [key]: data.url }));
      setUploadedFiles(prev => ({ ...prev, [key]: file.name }));
    } catch (err: any) {
      setError(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const removeDoc = (key: string) => {
    setDocuments(prev    => { const n = { ...prev };    delete n[key]; return n; });
    setUploadedFiles(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hasDoc = Object.values(documents).some(Boolean);
    if (!hasDoc) { setError('Please upload at least one document'); return; }

    setSubmitting(true);
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch('/api/kyc', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ documents, ...(bookingId ? { bookingId } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Submission failed'); setSubmitting(false); return; }

      setSuccess(true);
      setTimeout(() => {
        // If we came from booking flow, return there; otherwise go to dashboard
        router.push(bookingId ? `/booking/confirmation?bookingId=${bookingId}` : '/dashboard');
      }, 2000);
    } catch {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="card-premium max-w-sm w-full text-center py-10 animate-scale-in">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="heading-2 mb-2">Documents Submitted!</h2>
          <p className="text-stone-500 text-sm">Your documents are under review. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="flow-nav">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
          {bookingId && (
            <ol className="hidden sm:flex items-center step-nav">
              {['Dates','Terms','Payment','KYC'].map((s, i) => (
                <li key={s} className="flex items-center">
                  {i > 0 && <span className="step-nav-sep mx-1.5">›</span>}
                  <span className={`step-nav-item ${i === 3 ? 'active' : 'done'}`}>{s}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="heading-1">ID Verification (KYC)</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {bookingId
                ? 'Upload your ID documents to complete booking verification'
                : 'Keep your identity verified for seamless check-in on any booking'}
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Info size={15} className="text-amber-700 mt-0.5 flex-shrink-0" />
          <p className="text-stone-600 text-xs leading-relaxed">
            As per Indian hospitality regulations, all staying guests must provide at least one valid government-issued
            photo ID. Documents are encrypted and stored securely — never shared without consent.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map(doc => {
              const uploaded = !!uploadedFiles[doc.key];
              const busy     = uploading[doc.key];

              return (
                <div
                  key={doc.id}
                  className={`card transition-all duration-200 ${
                    uploaded ? 'border-emerald-200 bg-emerald-50/30' : 'hover:border-amber-300'
                  }`}
                >
                  {/* Title row */}
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} className={uploaded ? 'text-emerald-600' : 'text-amber-700'} />
                    <span className="text-sm font-semibold text-stone-900">{doc.name}</span>
                    {doc.required && (
                      <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                    {uploaded && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle size={11} /> Uploaded
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-400 mb-3">{doc.desc}</p>

                  {/* Uploaded file chip */}
                  {uploaded ? (
                    <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs">
                      <span className="text-stone-700 truncate max-w-[160px]">{uploadedFiles[doc.key]}</span>
                      <button
                        type="button"
                        onClick={() => removeDoc(doc.key)}
                        className="text-stone-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-xs ${
                      busy
                        ? 'border-amber-300 bg-amber-50/50 cursor-wait'
                        : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/30'
                    }`}>
                      {busy ? (
                        <span className="text-amber-700 font-medium animate-pulse">Uploading…</span>
                      ) : (
                        <>
                          <Upload size={14} className="text-amber-700" />
                          <span className="text-stone-500">Click to upload · JPG, PNG or PDF · max 5 MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        disabled={busy}
                        onChange={e => { if (e.target.files?.[0]) handleFileUpload(doc.key, e.target.files[0]); }}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          {/* Privacy note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-700">
            🔒 <strong>Privacy:</strong> Your documents are encrypted at rest. We comply with all Indian data
            protection laws and will never share your information without consent.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link href="/dashboard" className="btn-secondary flex-1 text-center text-sm">
              Back to Dashboard
            </Link>
            <button
              type="submit"
              disabled={submitting || !Object.values(documents).some(Boolean) || Object.values(uploading).some(Boolean)}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? 'Submitting…' : 'Submit Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

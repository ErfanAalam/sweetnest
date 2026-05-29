'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  X, 
  ShieldCheck, 
  Loader,
  Camera,
  Info,
  Check
} from 'lucide-react';

interface DocState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  url: string | null;
}

const REQUIRED_DOCS = [
  { key: 'aadhar', label: 'Aadhaar Card', desc: 'Government-issued resident identity card' },
  { key: 'pan', label: 'PAN Card', desc: 'Permanent Account Number taxation card' },
] as const;

const OPTIONAL_DOCS = [
  { key: 'passport', label: 'Passport', desc: 'First two pages of international passport' },
  { key: 'drivingLicense', label: 'Driving Licence', desc: 'Official regional transport license' },
] as const;

type DocKey = 'aadhar' | 'pan' | 'passport' | 'drivingLicense';

export default function KYCPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [docs, setDocs] = useState<Record<DocKey, DocState>>({
    aadhar: { file: null, preview: null, uploading: false, url: null },
    pan: { file: null, preview: null, uploading: false, url: null },
    passport: { file: null, preview: null, uploading: false, url: null },
    drivingLicense: { file: null, preview: null, uploading: false, url: null },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isMockMode = !process.env.NEXT_PUBLIC_AWS_S3_BUCKET ||
                     process.env.NEXT_PUBLIC_AWS_S3_BUCKET.includes('your-');

  const fileRefs = useRef<Record<DocKey, HTMLInputElement | null>>({
    aadhar: null, pan: null, passport: null, drivingLicense: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (!token || !pendingBooking) {
      router.push('/booking');
      return;
    }
    setBooking(JSON.parse(pendingBooking));
  }, [router]);

  const handleFileSelect = async (key: DocKey, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setError('Only JPG, PNG, or PDF files are allowed');
      return;
    }
    setError('');

    const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    setDocs(prev => ({
      ...prev,
      [key]: { ...prev[key], file, preview, uploading: true, url: null },
    }));

    // Upload file
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', key);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setDocs(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, url: data.url, preview: preview || data.url },
      }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setDocs(prev => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, file: null, preview: null },
      }));
    }
  };

  const removeDoc = (key: DocKey) => {
    if (docs[key].preview) URL.revokeObjectURL(docs[key].preview!);
    setDocs(prev => ({
      ...prev,
      [key]: { file: null, preview: null, uploading: false, url: null },
    }));
    if (fileRefs.current[key]) fileRefs.current[key]!.value = '';
  };

  const canSubmit =
    docs.aadhar.url !== null && docs.pan.url !== null &&
    !Object.values(docs).some(d => d.uploading);

  const handleSubmit = async () => {
    if (!canSubmit || !booking) return;
    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          documents: {
            aadharUrl: docs.aadhar.url,
            panUrl: docs.pan.url,
            passportUrl: docs.passport.url,
            drivingLicenseUrl: docs.drivingLicense.url,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed');

      localStorage.removeItem('pendingPayment');
      localStorage.removeItem('termsAccepted');
      router.push('/booking/confirmation');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const renderDocUpload = (key: DocKey, label: string, desc: string, required: boolean) => {
    const doc = docs[key];
    return (
      <div key={key} className={`bg-white border rounded-3xl p-5 md:p-6 transition-all duration-200 ${
        doc.url 
          ? 'border-emerald-500 bg-emerald-50/10' 
          : 'border-stone-200/80 hover:border-amber-500/40 shadow-sm'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-stone-50 rounded-lg text-amber-700">
                <FileText size={15} />
              </span>
              <h3 className="font-bold text-stone-900 text-xs md:text-sm">{label}</h3>
              {required ? (
                <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">REQUIRED</span>
              ) : (
                <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-stone-55 text-stone-500 border border-stone-200 rounded-full">OPTIONAL</span>
              )}
            </div>
            <p className="text-stone-400 text-[11px] mt-1">{desc}</p>
          </div>
          {doc.url && (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
              <Check size={11} />
              <span>Ready</span>
            </span>
          )}
        </div>

        {doc.url ? (
          <div className="flex items-center justify-between bg-stone-50/50 border border-stone-200 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              {doc.preview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200/60 shadow-sm bg-white">
                  <img src={doc.preview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-stone-900 font-bold truncate">File uploaded successfully</p>
                <p className="text-[10px] text-stone-400 truncate">{doc.file?.name || 'document_upload'}</p>
              </div>
            </div>
            <button 
              onClick={() => removeDoc(key)} 
              className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-rose-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : doc.uploading ? (
          <div className="flex items-center justify-center gap-2.5 p-6 bg-stone-50 rounded-2xl border border-stone-200/60">
            <Loader size={16} className="animate-spin text-amber-700" />
            <span className="text-xs text-stone-500 font-bold">Uploading document securely...</span>
          </div>
        ) : (
          <div
            onClick={() => fileRefs.current[key]?.click()}
            className="border-2 border-dashed border-stone-200/80 hover:border-amber-500/40 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:bg-amber-500/[0.02]"
          >
            <Upload size={22} className="text-amber-700 mx-auto mb-2" />
            <p className="text-xs text-stone-600 font-bold">Click to choose document file</p>
            <p className="text-[10px] text-stone-400 mt-1">Accepts JPG, PNG, PDF · Max file size 5MB</p>
          </div>
        )}

        <input
          type="file"
          ref={el => { fileRefs.current[key] = el; }}
          className="hidden"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={e => e.target.files?.[0] && handleFileSelect(key, e.target.files[0])}
        />
      </div>
    );
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-poppins selection:bg-amber-100 selection:text-amber-950 antialiased">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <ChevronLeft size={15} className="text-amber-700" />
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-amber-200 shadow-sm flex-shrink-0">
              <Image src="/logo.png" alt="Sweet Nest" fill className="object-cover" />
            </div>
            <span className="font-playfair text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">Sweet Nest</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-semibold">
            <span>1. Dates</span><span>→</span>
            <span>2. Terms</span><span>→</span>
            <span>3. Payment</span><span>→</span>
            <span className="text-amber-700">4. KYC</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 w-fit">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-stone-900">ID Verification (KYC)</h1>
            <p className="text-stone-500 text-xs mt-0.5">Comply securely with Indian guest hosting regulations</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-3xl flex items-start gap-3 shadow-sm">
          <Info size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
          <p className="text-stone-600 text-xs leading-relaxed">
            As per regional regulatory standards, all staying guests are required to upload verification documents. 
            All stored files are encrypted, handled locally or over private tunnels, and completely secure.
          </p>
        </div>

        {/* Sandbox Warning Banner */}
        {isMockMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-800 font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🧪 Local Storage Sandbox Active</span>
            </div>
            <p className="leading-relaxed">
              No AWS S3 credentials configured. Documents will be converted to local browser base64 storage so you can upload and preview files completely offline/sandbox!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="font-playfair text-base font-bold text-stone-900">Required Identity Cards</h2>
          {REQUIRED_DOCS.map(d => renderDocUpload(d.key, d.label, d.desc, true))}

          <h2 className="font-playfair text-base font-bold text-stone-900 pt-3">Supporting Documents (Optional)</h2>
          <p className="text-stone-400 text-xs -mt-2">Provide either to accelerate identity verification checks</p>
          {OPTIONAL_DOCS.map(d => renderDocUpload(d.key, d.label, d.desc, false))}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-250/30 rounded-xl p-4 text-rose-700 text-xs font-semibold">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary w-full py-3.5 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Confirming Booking...</span>
            </>
          ) : (
            <span>Submit Documents &amp; Complete Booking →</span>
          )}
        </button>

        {!canSubmit && (
          <p className="text-[10px] text-center text-stone-400 font-bold uppercase tracking-wider">
            🔒 Upload Aadhaar Card &amp; PAN Card to submit compliance
          </p>
        )}
      </div>
    </div>
  );
}

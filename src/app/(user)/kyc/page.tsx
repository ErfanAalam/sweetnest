import { Suspense } from 'react';
import { KYCForm } from './kyc-form';

function KYCFormSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-stone-200 border-t-amber-700 rounded-full"></div>
        <p className="mt-4 text-stone-600">Loading…</p>
      </div>
    </div>
  );
}

export default function KYCPage() {
  return (
    <Suspense fallback={<KYCFormSkeleton />}>
      <KYCForm />
    </Suspense>
  );
}

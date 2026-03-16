 'use client';

import { useEffect, useMemo, useRef } from 'react';
 import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
 import { verifyPayment, fetchMyPayments } from '@/lib/features/payment/paymentSlice';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';

 import { Suspense } from 'react';

function CallbackContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const { verificationStatus, error } = useAppSelector((state) => state.payment);

  const reference = useMemo(() => {
    const ref = params.get('reference');
    const alt = params.get('trxref') || params.get('merchantTxnref');
    return ref || alt || '';
  }, [params]);

  const verifiedRef = useRef(false);
  useEffect(() => {
    if (!reference || verifiedRef.current) return;
    verifiedRef.current = true;
    dispatch(verifyPayment(reference))
      .unwrap()
      .then(() => {
        dispatch(fetchMyPayments());
      })
      .catch(() => {});
  }, [dispatch, reference]);

  const status = useMemo<'verifying' | 'success' | 'failed' | 'pending'>(() => {
    if (!reference) return 'failed';
    if (verificationStatus === 'success') return 'success';
    if (verificationStatus === 'failed') return 'failed';
    if (verificationStatus === 'pending') return 'pending';
    return 'verifying';
  }, [reference, verificationStatus]);

  const message = useMemo(() => {
    if (!reference) return 'Missing payment reference.';
    if (status === 'success') return 'Payment verified successfully.';
    if (status === 'failed') return (error || 'Payment verification failed.') + ' Note: reconciliation may update later automatically.';
    if (status === 'pending') return (error || 'Payment not confirmed yet.') + ' Reconciliation may update later automatically.';
    return 'Verifying payment...';
  }, [reference, status, error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Verifying Payment</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Payment Confirmed</h1>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Payment Failed</h1>
          </>
        )}
        {status === 'pending' && (
          <>
            <AlertCircle className="w-10 h-10 text-yellow-600 mx-auto" />
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50">Pending Verification</h1>
          </>
        )}
        <p className="text-sm text-zinc-500">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard/fees')}>
            Return to Fees
          </Button>
          {(status === 'failed' || status === 'pending') && (
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (reference) {
                  dispatch(verifyPayment(reference))
                    .unwrap()
                    .then(() => dispatch(fetchMyPayments()))
                    .catch(() => {});
                }
              }}
            >
              Retry Verification
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
        <p className="font-bold uppercase tracking-widest text-[10px]">Processing Callback...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

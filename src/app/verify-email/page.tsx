'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Mail,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import logo from '../../../public/asserts/logo.png';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(
    token ? '' : 'Missing verification token. Please check your email link or request a new one.'
  );

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully. Your journey at Nigerian British University begins now.');
      } catch (error: unknown) {
        console.error('Verification failed:', error);
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } } };
        const errorMessage = err.response?.data?.message || 'Verification failed. The link may be invalid or expired.';
        setMessage(errorMessage);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-zinc-100 p-10 relative overflow-hidden">
        {/* Status Background Accent */}
        <div className={`absolute top-0 left-0 w-full h-2 ${
          status === 'loading' ? 'bg-zinc-200' : 
          status === 'success' ? 'bg-green-500' : 'bg-[#c0392b]'
        }`} />

        <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-10 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Image
                src={logo}
                alt="NBU Logo"
                width={120}
                height={60}
                className="object-contain"
                />
            </div>

            {/* Status Icon */}
            <div className="mb-8 relative">
                {status === 'loading' && (
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-zinc-100 rounded-full" />
                        <div className="w-20 h-20 border-4 border-[#c0392b] border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                        <Mail className="w-10 h-10 text-[#c0392b] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                )}
                {status === 'success' && (
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                )}
                {status === 'error' && (
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                        <XCircle className="w-12 h-12 text-[#c0392b]" />
                    </div>
                )}
            </div>

            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-4">
                {status === 'loading' && 'Verifying Access'}
                {status === 'success' && 'Verification Complete'}
                {status === 'error' && 'Request Denied'}
            </h1>

            <p className="text-zinc-500 text-lg leading-relaxed mb-10 px-4">
                {status === 'loading' && 'We are currently authenticating your enrollment credentials. This will only take a moment.'}
                {message}
            </p>

            <div className="w-full space-y-4">
                {status !== 'loading' && (
                    <button 
                        className={`w-full h-[60px] flex items-center justify-center gap-3 font-bold text-lg rounded-2xl transition-all active:scale-[0.98] ${
                            status === 'success' 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/10'
                            : 'bg-[#c0392b] hover:bg-[#a93226] text-white shadow-lg shadow-red-900/10'
                        }`}
                        onClick={() => router.push('/')}
                    >
                        <span>{status === 'success' ? 'Enter Portal' : 'Try Again'}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}

                {status === 'error' && (
                    <button 
                        className="w-full h-[60px] flex items-center justify-center gap-3 font-bold text-lg rounded-2xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-all"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Return to Safety</span>
                    </button>
                )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 select-none w-fit">
                <ShieldCheck className="text-zinc-400 w-4 h-4" />
                <p className="text-[#c0392b] text-[10px] font-black uppercase tracking-[0.3em]">Institutional Verification Secure</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#f8f9fa] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c0392b]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c0392b]/10 blur-[120px] rounded-full" />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="w-12 h-12 animate-spin text-[#c0392b]" />
          <p className="font-bold uppercase tracking-widest text-[10px]">Initializing...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em]">Nigerian British University Admissions</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAdmissionProfile } from '@/lib/features/admission/admissionSlice';
import MessagesUI from './MessagesUI';
import { Loader2, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { application, loading, profile } = useAppSelector((state) => state.admission);

  useEffect(() => {
    dispatch(fetchAdmissionProfile());
  }, [dispatch]);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use application ID if available, otherwise undefined (generic messaging)
  const appId = application?.id;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Messages Header */}
      <div className="relative h-40 rounded-3xl bg-gradient-to-r from-red-600 to-red-800 overflow-hidden shadow-xl shadow-red-500/10 flex items-center px-10">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl animate-pulse" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Communication Hub</h1>
            <p className="text-red-100/80 font-medium">Direct correspondence with the Admission Office</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <MessagesUI applicationId={appId} />
      </div>
    </div>
  );
}

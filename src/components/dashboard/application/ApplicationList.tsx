'use client';

import React from 'react';
import { useAppSelector } from '@/lib/hooks';
import { Plus, FileText, ArrowRight, Clock, ShieldCheck, Sparkles, AlertCircle, Eye } from 'lucide-react';
import { Application } from '@/lib/features/admission/admissionSlice';
import Link from 'next/link';

interface ApplicationListProps {
  onStartNew: () => void;
  onContinue: (app: Application) => void;
}

export default function ApplicationList({ onStartNew, onContinue }: ApplicationListProps) {
  const { applications } = useAppSelector((state) => state.admission);
  const { faculties, programs } = useAppSelector((state) => state.academic);

  const hasDraft = applications.some(app => app.status === 'DRAFT');
  const appWithModification = applications.find(app => app.editRequested || app.modificationNote);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
        return {
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400',
            label: 'Submitted'
        };
      case 'DRAFT':
        return {
            color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
            label: 'Draft'
        };
      case 'REJECTED':
        return {
            color: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
            label: 'Rejected'
        };
      case 'ADMITTED':
      case 'ACCEPTED':
        return {
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400',
            label: 'Accepted'
        };
      case 'ON_HOLD':
        return {
            color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
            label: 'On Hold'
        };
      default:
        return {
            color: 'text-zinc-600 bg-zinc-50 border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800 dark:text-zinc-400',
            label: status
        };
    }
  };

  const getProgramName = (programId?: string) => {
    if (!programId) return 'Not yet selected';
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const getFacultyName = (facultyId?: string) => {
    if (!facultyId) return 'Not yet selected';
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full space-y-10">
        
        {/* Header section - more compact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Admission Hub</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Admission Dashboard</h1>
          </div>
          {!hasDraft && (
            <button
                onClick={onStartNew}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 hover:bg-red-500 hover:scale-[1.02] transition-all active:scale-95 group"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>New Application</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Active Applications</h2>
                </div>

                {applications.length > 0 ? (
                    <div className="space-y-6">
                        {applications.map((application) => (
                            <div key={application.id} className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-[32px] blur opacity-5 group-hover:opacity-10 transition duration-500" />
                                
                                <div className="relative bg-white dark:bg-zinc-950 rounded-[30px] border border-zinc-200/60 dark:border-zinc-800/60 p-6 md:p-8 shadow-sm group-hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner shrink-0 text-xl md:text-2xl font-black">
                                                <FileText className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight truncate">
                                                        {application.applicationNumber || 'APP/2026/0001'}
                                                    </h3>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getStatusConfig(application.status).color}`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                                            {getStatusConfig(application.status).label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Session: 2024/2025</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3">
                                            {['ADMITTED', 'ACCEPTED'].includes(application.status) && application.admissionLetterUrl && (
                                                <button 
                                                    onClick={() => window.open(application.admissionLetterUrl, '_blank')}
                                                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3.5 bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-xl font-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm text-xs md:text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View Letter</span>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onContinue(application)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-zinc-900/10 text-xs md:text-sm"
                                            >
                                                <span>{application.status !== 'DRAFT' ? 'View Details' : 'Continue'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-100 dark:border-zinc-900">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Program</span>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">{getProgramName(application.programmeId)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Entry</span>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{application.entryMode || 'UTME'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Faculty</span>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">{getFacultyName(application.facultyId)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-950 rounded-[30px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center px-6">
                        <FileText className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mb-4" />
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2">No active applications.</h3>
                        <p className="text-zinc-500 text-sm max-w-xs font-medium mb-8">
                            Take the first step towards your academic future by starting a new application today.
                        </p>
                        <button
                            onClick={onStartNew}
                            className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        >
                            Start Now
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar / Supportive Info */}
            <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Guidelines</h2>
                </div>

                <div className="bg-white dark:bg-zinc-950 rounded-[30px] border border-zinc-200/60 dark:border-zinc-800/60 p-6 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-800/50 group">
                            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Saved Progress</h4>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">Your application state is saved automatically. Resume anytime.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/50">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Data Security</h4>
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">All your uploaded credentials are encrypted and securely stored.</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 w-full" />

                    <div className="space-y-3 px-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Need Assistance?</h4>
                        <Link href="/help" className="flex items-center justify-between group p-3 -mx-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Admission FAQ</span>
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-red-600 transition-colors" />
                        </Link>
                        <Link href="/support" className="flex items-center justify-between group p-3 -mx-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Contact Support</span>
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-red-600 transition-colors" />
                        </Link>
                    </div>
                </div>

                {appWithModification && (
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100/50 dark:border-amber-900/30 rounded-[30px] flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-amber-900 dark:text-amber-400">Modification Note</h4>
                            <p className="text-[11px] font-bold text-amber-700/80 leading-relaxed mt-1 uppercase tracking-tight">
                                {appWithModification.modificationNote || 'Action Required'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { submitApplication, requestEditAccess } from '@/lib/features/admission/admissionSlice';
import { showAlert } from '@/lib/features/ui/uiSlice';
import { getFileUrl } from '@/lib/config';
import { 
  Loader2, ArrowLeft, Send, Save, CheckCircle2, User, 
  GraduationCap, FileText, Files, AlertCircle,
  MapPin, Phone, Mail, Calendar, BookOpen, GraduationCap as Cap,
  Award, ScrollText, Check, ShieldCheck, Lock, Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface ApplicationReviewProps {
  onBack: () => void;
  onExit: () => void;
  readOnly?: boolean;
}

export default function ApplicationReview({ onBack, onExit, readOnly = false }: ApplicationReviewProps) {
  const dispatch = useAppDispatch();
  const { application, profile, loading } = useAppSelector((state) => state.admission);
  const { faculties, programs } = useAppSelector((state) => state.academic);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editReason, setEditReason] = React.useState('');
  const [requestLoading, setRequestLoading] = React.useState(false);

  const getProgramName = (programId?: string) => {
    if (!programId) return 'Not Selected';
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const getFacultyName = (facultyId?: string) => {
    if (!facultyId) return 'Not Selected';
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitApplication(application?.id)).unwrap();
      dispatch(showAlert({
        type: 'success',
        title: 'Submission Authenticated',
        message: 'Your official application dossier has been successfully delivered to the registry.'
      }));
      onExit();
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'The registry failed to accept your application transmission.');
      dispatch(showAlert({
        type: 'error',
        title: 'Transmission Blocked',
        message: message
      }));
    }
  };

  const handleRequestEdit = async () => {
    if (!editReason.trim()) return;
    setRequestLoading(true);
    try {
      await dispatch(requestEditAccess({ reason: editReason, applicationId: application?.id })).unwrap();
      dispatch(showAlert({
        type: 'success',
        title: 'Request Logged',
        message: 'Your edit access petition has been formally recorded and is awaiting administrative review.'
      }));
      setShowEditModal(false);
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'The system failed to register your edit access request.');
      dispatch(showAlert({
        type: 'error',
        title: 'Registry Rejection',
        message: message
      }));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSaveDraft = () => {
    dispatch(showAlert({
      type: 'success',
      title: 'Dossier Cached',
      message: 'Your application state has been successfully preserved in our temporary archives.'
    }));
    onExit();
  };


  if (!application || !profile) {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Assembling your profile...</p>
        </div>
    );
  }

  const toRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
    return {};
  };

  const toArray = (value: unknown): Array<Record<string, unknown>> => {
    if (Array.isArray(value)) return value as Array<Record<string, unknown>>;
    return [];
  };

  const formatValue = (value: unknown, fallback = 'N/A') => {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return fallback;
  };

  const renderAcademicResult = (result: { resultType: string; details?: unknown }): React.ReactNode => {
    if (result.resultType === 'JAMB') {
        const details = toRecord(result.details);
        const subjects = toArray(details.subjects);
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-red-500" />
                        <span className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight text-lg">JAMB UTME Result</span>
                    </div>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-black uppercase tracking-widest">
                        Score: {formatValue(details.score)}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                    {subjects.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 truncate">{formatValue(s.subject, 'Subject')}</p>
                            <p className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{formatValue(s.score)}</p>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    <span>Reg No: {formatValue(details.regNumber)}</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                    <span>Year: {formatValue(details.year)}</span>
                </div>
            </div>
        );
    }

    if (result.resultType === 'O-LEVEL') {
        const details = toRecord(result.details);
        const subjects = toArray(details.sittings);
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-red-500" />
                        <span className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight text-lg">
                            {formatValue(details.examType, 'O-Level')} Result
                        </span>
                    </div>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-black uppercase tracking-widest">
                        {typeof details.schoolName === 'string' ? `${details.schoolName.substring(0, 15)}...` : 'Result'}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subjects.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                            <span className="text-xs font-bold text-zinc-500 truncate mr-2">{formatValue(s.subject, 'Subject')}</span>
                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{formatValue(s.grade)}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    <span>Exam No: {formatValue(details.examNumber)}</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                    <span>Year: {formatValue(details.examYear)}</span>
                </div>
            </div>
        );
    }

    if (result.resultType === 'DEGREE') {
        const details = toRecord(result.details);
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-red-600" />
                        <span className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight text-lg">
                            Institutional Background
                        </span>
                    </div>
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-black uppercase tracking-widest">
                        CGPA: {formatValue(details.cgpa)} / {formatValue(details.maxCgpa)}
                    </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Institution</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatValue(details.institution)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Duration</span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            {typeof details.startDate === 'string' ? new Date(details.startDate).getFullYear() : 'N/A'} - {typeof details.endDate === 'string' ? new Date(details.endDate).getFullYear() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <span className="font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest text-xs mb-2 block">{result.resultType}</span>
            <pre className="text-[10px] font-mono whitespace-pre-wrap opacity-60">
                {JSON.stringify(result.details ?? {}, null, 2)}
            </pre>
        </div>
    );
  };

  return (
    <div className="w-full py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Final Validation</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">Review & Confirm</h2>
            <p className="text-sm md:text-lg text-zinc-500 font-medium max-w-xl leading-relaxed">
                Take a moment to verify all your information. You can go back to edit any section before final submission.
            </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            {application?.status === 'DRAFT' && (
            <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
            >
                Edit Form
            </Button>
            )}
        </div>
      </div>

      {/* Feedback Banner */}
      {application?.modificationNote && (
        <div className={`p-4 md:p-6 rounded-[24px] border-2 ${
            application.status === 'DRAFT' 
            ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800' 
            : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800'
        } flex flex-col sm:flex-row items-start gap-4 md:gap-5 animate-in fade-in slide-in-from-top-4`}>
            <div className={`p-3 rounded-2xl shrink-0 ${
                application.status === 'DRAFT' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
                {application.status === 'DRAFT' ? (
                    <Unlock className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                    <Lock className="w-5 h-5 md:w-6 md:h-6" />
                )}
            </div>
            <div className="space-y-2 flex-1">
                <h4 className={`text-xl font-black tracking-tight ${
                    application.status === 'DRAFT' 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                    {application.status === 'DRAFT' ? 'Edit Request Accepted' : 'Edit Request Rejected'}
                </h4>
                <p className={`text-base font-medium leading-relaxed ${
                    application.status === 'DRAFT' 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                    {application.status === 'DRAFT' 
                        ? 'The admission officer has unlocked your application for correction. Please make the necessary changes and re-submit.'
                        : 'Your request to edit this application was declined. You cannot make changes at this time.'}
                </p>
                <div className={`mt-4 p-4 rounded-2xl border ${
                    application.status === 'DRAFT' 
                    ? 'bg-white dark:bg-black/20 border-blue-100 dark:border-blue-800/50' 
                    : 'bg-white dark:bg-black/20 border-red-100 dark:border-red-800/50'
                }`}>
                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2 ${
                        application.status === 'DRAFT' ? 'text-red-400' : 'text-red-400'
                    }`}>
                        Officer&apos;s Reason
                    </p>
                    <p className={`text-sm md:text-base font-bold italic ${
                        application.status === 'DRAFT' ? 'text-red-900 dark:text-red-100' : 'text-red-900 dark:text-red-100'
                    }`}>
                        &ldquo;{application.modificationNote || 'N/A'}&rdquo;
                    </p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Main Review Content */}
        <div className="lg:col-span-3 space-y-8">
            
            {/* Personal Profile Section */}
            <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/10 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-lg shadow-zinc-200/20 overflow-hidden shrink-0">
                            {profile.passportUrl ? (
                                <Image
                                    src={getFileUrl(profile.passportUrl)}
                                    alt="Applicant"
                                    fill
                                    sizes="(max-width: 768px) 48px, 64px"
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <User className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Personal Identity</h3>
                            <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Legal Name & Demographics</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 md:gap-y-8">
                    {/* Identity & Contact */}
                    <div className="space-y-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name</p>
                        <p className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">{profile.firstName || user?.firstName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Middle Name</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{profile.middleName || user?.middleName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{profile.lastName || user?.lastName || 'N/A'}</p>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Contact</p>
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold underline underline-offset-4 text-sm">
                            <Mail className="w-4 h-4" />
                            {profile.email || user?.email}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mobile Number</p>
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                            <Phone className="w-4 h-4 text-zinc-400" />
                            {profile.phone || 'N/A'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date of Birth</p>
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Gender</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{profile.gender || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nationality</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{profile.nationality || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">State of Origin</p>
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            {profile.stateOfOrigin || 'N/A'} ({profile.lga || 'N/A'})
                        </div>
                    </div>

                    <div className="space-y-1 lg:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Residential Address</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{profile.address || 'N/A'}</p>
                    </div>

                    {/* Divider */}
                    <div className="sm:col-span-2 lg:col-span-3 h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

                    {/* Guardian Info */}
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Guardian Name</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{profile.nameOfGuardian || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Guardian Contact</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{profile.guardianPhone || 'N/A'}</p>
                        <p className="text-xs text-zinc-500">{profile.guardianEmail}</p>
                    </div>

                    {/* Next of Kin Info */}
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Next of Kin</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{profile.nextOfKin || 'N/A'}</p>
                        <p className="text-xs font-bold text-zinc-500 uppercase">{profile.nextOfKinRelationship || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Next of Kin Contact</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{profile.nextOfKinPhone || 'N/A'}</p>
                        <p className="text-xs text-zinc-500">{profile.nextOfKinEmail}</p>
                    </div>
                </div>
            </div>

            {/* Academic Track Section */}
            <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/10 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                            <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Academic History</h3>
                            <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">UTME & O-Level Verifications</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-8 space-y-10">
                    {application.academicResults && application.academicResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-10">
                            {application.academicResults.map((result, idx) => (
                                <div key={idx} className="relative group/result">
                                    <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50 transition-opacity group-hover/result:opacity-100" />
                                    {renderAcademicResult(result)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 grayscale opacity-40">
                            <FileText className="w-12 h-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No results detected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Vault Section */}
            <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/10 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-800 text-white flex items-center justify-center shadow-lg shadow-red-800/20 shrink-0">
                            <Files className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Document Credentials</h3>
                            <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Uploaded Certificates & ID</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-8">
                    {application?.documents && application.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {application.documents.map((doc, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 truncate">{doc.documentName}</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 shrink-0 ml-2">Ready</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 italic text-center py-6 font-medium">No documents uploaded.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Actions & Summary */}
        <div className="space-y-8">
            
            {/* Program Summary Card */}
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-[32px] p-6 md:p-8 text-white shadow-2xl shadow-red-900/20 relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 blur-[80px] rounded-full -mr-16 -mt-16 opacity-30 group-hover:opacity-50 transition-opacity" />
                
                <div className="relative z-10 space-y-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Cap className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Chosen Program</p>
                        <h4 className="text-lg md:text-xl font-black tracking-tight leading-tight">{getProgramName(application.programmeId)}</h4>
                        <p className="text-[10px] md:text-xs font-bold text-red-400 mt-2">{getFacultyName(application.facultyId)}</p>
                    </div>
 
                    <div className="h-px bg-white/10 w-full" />
 
                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Entry Level</p>
                            <p className="font-bold text-xs md:text-sm">{application.entryMode || 'UTME'}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Session</p>
                            <p className="font-bold text-xs md:text-sm">{application.session?.academicSessionName || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Requirements Checklist */}
            <div className="bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 space-y-6 shadow-xl shadow-zinc-200/10">
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    Submission Ready?
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 group">
                        <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">Profile Information Verified</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">Documents Attached</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className={`w-5 h-5 rounded-full border-2 ${application.academicResults?.length ? 'border-green-500' : 'border-zinc-200'} flex items-center justify-center`}>
                            {application.academicResults?.length ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full" />}
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">Academic History Synced</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
            {application.status === 'DRAFT' && !readOnly ? (
                    <>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full h-14 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Application</span>
                                    <Send className="w-5 h-5" />
                                </>
                            )}
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={onBack}
                                variant="outline"
                                className="h-14 rounded-2xl border-2 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Edit
                            </Button>
                            <Button
                                onClick={handleSaveDraft}
                                variant="outline"
                                className="h-14 rounded-2xl border-2 font-bold text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Save Draft
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {['ADMITTED', 'ACCEPTED'].includes(application.status) ? (
                            <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl flex items-start gap-4 text-green-800 dark:text-green-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award className="w-32 h-32" />
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl shrink-0 z-10">
                                    <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="z-10">
                                    <p className="font-black text-xl tracking-tight mb-1">Congratulations!</p>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed max-w-md">
                                        You have been offered provisional admission into the university. 
                                        Please return to your dashboard to view your admission letter and proceed with clearance.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400">
                                <CheckCircle2 className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="font-bold">Application Submitted</p>
                                    <p className="text-xs opacity-80">Your application is under review. You will be notified of any updates.</p>
                                </div>
                            </div>
                        )}

                        {application.editRequested ? (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                <Lock className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="font-bold">Edit Request Pending</p>
                                    <p className="text-xs opacity-80">Your request to edit this application is awaiting approval by the DAP.</p>
                                    {application.editRequestReason && (
                                        <p className="text-[10px] mt-1 font-medium opacity-60">Reason: {application.editRequestReason}</p>
                                    )}
                                </div>
                            </div>
                        ) : !['ADMITTED', 'ACCEPTED'].includes(application.status) && (
                             <Button
                                onClick={() => setShowEditModal(true)}
                                variant="outline"
                                className="w-full h-12 border-dashed border-2 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            >
                                <Unlock className="w-4 h-4 mr-2" />
                                Request Edit Access
                            </Button>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                onClick={onExit}
                                className="h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm md:text-lg active:scale-95 transition-all"
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500/80 leading-relaxed uppercase tracking-wider">
                    Attention: Once submitted, you will not be able to modify your choices unless requested by the board.
                </p>
            </div>
        </div>
      </div>
      
      {/* Edit Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[32px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                         <Unlock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Request Edit Access</h3>
                    <p className="text-sm text-zinc-500 font-medium mt-2 leading-relaxed">
                        Please provide a valid reason for requesting to edit your submitted application. 
                        This request must be approved by the DAP.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Reason for Request</label>
                    <textarea 
                        className="w-full h-32 p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 resize-none focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
                        placeholder="e.g., I made a mistake in my O-Level results..."
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                        variant="outline" 
                        className="h-12 rounded-xl font-bold border-2"
                        onClick={() => setShowEditModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className="h-12 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                        onClick={handleRequestEdit}
                        disabled={!editReason.trim() || requestLoading}
                    >
                        {requestLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Request'}
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

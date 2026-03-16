'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchFaculties, fetchPrograms, fetchSessions } from '@/lib/features/academic/academicSlice';
import { initializeApplication, updateApplication, fetchActiveSession } from '@/lib/features/admission/admissionSlice';
import { showAlert } from '@/lib/features/ui/uiSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, ArrowRight, GraduationCap, ArrowLeft, AlertCircle, BadgeCheck, Sparkles } from "lucide-react"

interface ProgramSelectionFormProps {
  onContinue?: () => void;
  onBack?: () => void;
  readOnly?: boolean;
}

const ProgramSelectionForm = ({ onContinue, onBack, readOnly = false }: ProgramSelectionFormProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { faculties, programs, sessions, loading: academicLoading } = useAppSelector((state) => state.academic);
  const { application, activeSession, loading: admissionLoading, activeSessionFetched } = useAppSelector((state) => state.admission);

  // Initialize state from application if available to avoid race conditions
  const [selectedAcademicSessionId, setSelectedAcademicSessionId] = useState<string>('');
  const [selectedProgramType, setSelectedProgramType] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedEntryMode, setSelectedEntryMode] = useState<string>('');
  
  // Load active session on mount
  useEffect(() => {
    if (!activeSessionFetched && !admissionLoading) {
        dispatch(fetchActiveSession());
    }
  }, [dispatch, activeSessionFetched, admissionLoading]);

  // Load faculties and programs only if session is active
  useEffect(() => {
    if (activeSession) {
        if (faculties.length === 0) dispatch(fetchFaculties());
        // Fetch all programs once
        if (programs.length === 0) dispatch(fetchPrograms());
        if (sessions.length === 0) dispatch(fetchSessions());
    }
  }, [dispatch, activeSession, faculties.length, programs.length, sessions.length]);

  const effectiveProgramId = selectedProgramId || application?.programmeId || '';
  const selectedProgram = programs.find(p => p.id === effectiveProgramId);

  // Derive Program Type
  const effectiveProgramType = selectedProgramType || selectedProgram?.programLevel?.name || '';

  // Derive Faculty ID from Program -> Department -> Faculty
  const derivedDepartmentId = selectedProgram?.departmentId || '';
  const derivedFacultyId = (() => {
    if (derivedDepartmentId) {
      const f = faculties.find((f) => f.departments?.some((d) => d.id === derivedDepartmentId))
      return f?.id || ''
    }
    return application?.facultyId || ''
  })()

  const effectiveEntryMode = selectedEntryMode || application?.entryMode || 'UTME';
  const effectiveAcademicSessionId =
    selectedAcademicSessionId ||
    application?.sessionId ||
    sessions.find((s) => s.isCurrent)?.id ||
    '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.name;

    if (readOnly) {
      if (action === 'continue' && onContinue) {
        onContinue();
      } else if (action === 'save-leave') {
        router.push('/dashboard');
      }
      return;
    }

    if (!effectiveProgramId || !derivedFacultyId) {
        dispatch(showAlert({
          type: 'warning',
          title: 'Selection Required',
          message: 'Please designate your preferred academic program before proceeding.'
        }));
        return;
    }

    if (!effectiveAcademicSessionId) {
        dispatch(showAlert({
          type: 'warning',
          title: 'Session Undefined',
          message: 'Please identify the academic session for which you are applying.'
        }));
        return;
    }

    const selectedAcademicSession = sessions.find((s) => s.id === effectiveAcademicSessionId);
    if (selectedAcademicSession && !selectedAcademicSession.isCurrent) {
        dispatch(showAlert({
          type: 'error',
          title: 'Stale Session',
          message: 'The selected academic calendar is no longer accepting new dossiers. Please select an active session.'
        }));
        return;
    }

    const payload = {
        programId: effectiveProgramId,
        facultyId: derivedFacultyId,
        entryMode: effectiveEntryMode,
        sessionId: effectiveAcademicSessionId
    };

    try {
        let resultAction;
        // Check if application exists (and is editable)
        if (application) {
             // If submitted, prevent edit (unless requested)
             if (application.status !== 'DRAFT' && application.status !== 'ON_HOLD' && !application.editRequested && !application.modificationNote) {
                 dispatch(showAlert({
                   type: 'error',
                   title: 'Record Locked',
                   message: 'This application has already been formally submitted. Modifications are restricted.'
                 }));
                 return;
             }
             resultAction = await dispatch(updateApplication({ ...payload, id: application.id }));
        } else {
             resultAction = await dispatch(initializeApplication(payload));
        }

        if (initializeApplication.fulfilled.match(resultAction) || updateApplication.fulfilled.match(resultAction)) {
            if (action === 'save-leave') {
                dispatch(showAlert({
                  type: 'success',
                  title: 'Selection Archived',
                  message: 'Your program preferences have been successfully stored in our registry.'
                }));
                router.push('/dashboard');
            } else {
                dispatch(showAlert({
                  type: 'success',
                  title: 'Phase Finalized',
                  message: 'Program parameters established. Advancing to the next assessment stage.'
                }));
                if (onContinue) onContinue();
            }
        } else {
            dispatch(showAlert({
              type: 'error',
              title: 'Registry Error',
              message: 'The system failed to synchronize your program selection.'
            }));
        }
    } catch {
        dispatch(showAlert({
          type: 'error',
          title: 'Critical Exception',
          message: 'An internal synchronization error occurred. Please refresh and try again.'
        }));
    }
  };

  const programTypes = (() => {
    const types = new Set(programs.map((p) => p.programLevel?.name).filter((name): name is string => !!name));
    return Array.from(types).sort();
  })()

  const filteredPrograms = (() => {
    if (!effectiveProgramType) return [];
    return programs.filter((p) => p.programLevel?.name === effectiveProgramType);
  })()
  
  const availableEntryModes = selectedProgram?.entryMode || ['UTME', 'DIRECT_ENTRY'];

  const isLoading = academicLoading || admissionLoading;

  const sessionChecked = activeSessionFetched && !admissionLoading;
  if (sessionChecked && !activeSession) {
    return (
      <div className="w-full p-12 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">Application Period Closed</h2>
        <p className="text-zinc-500 font-medium max-w-md mx-auto mb-8">
          There is currently no active application session. Please check back later or contact the admission office for more information.
        </p>
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl hover:opacity-90 font-bold transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div key={application?.id || 'new-app'} className="w-full p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 animaite-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
             <GraduationCap className="w-8 h-8 text-red-600" />
             Program Selection
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Select your preferred course of study and entry mode</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800">
          <BadgeCheck className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Choice Phase</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Academic Session Selection */}
          <div className="space-y-3 md:col-span-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              Academic Session
            </label>
            <div className="relative">
              <Select
                value={effectiveAcademicSessionId}
                onValueChange={(value) => {
                  const s = sessions.find((sess) => sess.id === value);
                  if (s && !s.isCurrent) {
                    dispatch(showAlert({
                      type: 'warning',
                      title: 'Session Restricted',
                      message: "The chosen academic calendar is currently inactive."
                    }));
                    return;
                  }
                  setSelectedAcademicSessionId(value);
                }}
                disabled={isLoading || readOnly}
              >
                <SelectTrigger className="rounded-2xl h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-red-500/10 transition-all text-base font-semibold">
                  {isLoading && sessions.length === 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue placeholder="Select academic session" />}
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2 max-h-[300px]">
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="rounded-xl py-3 focus:bg-red-50 dark:focus:bg-red-900/20">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold">{s.name}</span>
                        {!s.isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Inactive</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {sessions.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-zinc-500 text-sm italic">No academic sessions available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Program Type Selection */}
          <div className="space-y-3 md:col-span-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <GraduationCap className="w-3 h-3" /> Program Type
            </label>
            <div className="relative">
              <Select 
                value={effectiveProgramType} 
                onValueChange={(value) => {
                  setSelectedProgramType(value);
                  setSelectedProgramId('');
                  setSelectedEntryMode('');
                }}
                disabled={isLoading || readOnly}
              >
                <SelectTrigger className="rounded-2xl h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-red-500/10 transition-all text-base font-semibold">
                  {isLoading && programs.length === 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue placeholder="Select program type" />}
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-2">
                  {programTypes.map((type) => (
                    <SelectItem key={type} value={type} className="rounded-xl py-3 focus:bg-red-50 dark:focus:bg-red-900/20">
                      {type}
                    </SelectItem>
                  ))}
                  {programTypes.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-zinc-500 text-sm italic">No program types available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Program Selection */}
          <div className="space-y-3 md:col-span-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <Sparkles className="w-3 h-3" /> Program of Interest
            </label>
            <Select 
              value={effectiveProgramId} 
              onValueChange={(value) => {
                setSelectedProgramId(value);
                setSelectedEntryMode('');
              }}
              disabled={!effectiveProgramType || isLoading || readOnly}
            >
              <SelectTrigger className="rounded-2xl h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-red-500/10 transition-all text-base font-semibold">
                <SelectValue placeholder={!effectiveProgramType ? "Select program type first" : "Select program"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 max-h-[300px]">
                {filteredPrograms.map((prog) => (
                  <SelectItem key={prog.id} value={prog.id} className="rounded-xl py-3 focus:bg-red-50 dark:focus:bg-red-900/20">
                    <div className="flex flex-col">
                        <span className="font-bold">{prog.name}</span>
                    </div>
                  </SelectItem>
                ))}
                 {filteredPrograms.length === 0 && effectiveProgramType && (
                    <div className="p-4 text-center text-zinc-500 text-sm italic">No programs available</div>
                  )}
              </SelectContent>
            </Select>
          </div>

          {/* Entry Mode Selection */}
          <div className="space-y-3 md:col-span-2 group">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
               Entry Method
            </label>
            <Select 
              value={effectiveEntryMode} 
              onValueChange={(value) => setSelectedEntryMode(value)}
              disabled={!effectiveProgramId || isLoading || readOnly}
            >
              <SelectTrigger className="rounded-2xl h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold uppercase tracking-wider">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2">
                {availableEntryModes.map((mode) => (
                  <SelectItem key={mode} value={mode} className="rounded-xl py-3 font-bold text-xs uppercase tracking-wide">
                    {mode.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-900">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold transition-all disabled:opacity-50 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}

            {!readOnly && (
              <button
                type="submit"
                name="save-leave"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold transition-all disabled:opacity-50 active:scale-95"
              >
                <Save className="w-5 h-5" />
                <span>Draft</span>
              </button>
            )}
            
            <button
              type="submit"
              name="continue"
              disabled={isLoading || !effectiveAcademicSessionId}
              className="flex items-center gap-3 px-10 py-4 bg-red-600 text-white font-extrabold rounded-2xl shadow-xl shadow-red-600/30 hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all ml-auto disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
      </form>
    </div>
  );
};

export default ProgramSelectionForm;

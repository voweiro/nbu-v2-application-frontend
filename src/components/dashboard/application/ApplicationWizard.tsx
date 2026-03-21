'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import ProgramSelectionForm from './ProgramSelectionForm';
import ProgramRequirementForm from './ProgramRequirementForm';
import ApplicationReview from './ApplicationReview';
import { Check, GraduationCap, FileText, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

const STEPS = [
  { id: 'program-selection', title: 'Program Selection', icon: GraduationCap, description: 'Choice of Study' },
  { id: 'requirements', title: 'Academic History', icon: FileText, description: 'Academic Records' },
  { id: 'review', title: 'Review & Submit', icon: ShieldCheck, description: 'Final Validation' },
];

interface ApplicationWizardProps {
  onExit: () => void;
}

export default function ApplicationWizard({ onExit }: ApplicationWizardProps) {
  const { application } = useAppSelector((state) => state.admission);
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const savedStep = sessionStorage.getItem('application_step');
    if (!savedStep) return 0;
    const parsed = Number.parseInt(savedStep, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  });
  // Allow editing if status is DRAFT OR ON_HOLD OR edit is requested OR modification note exists (sent back for corrections)
  const isReadOnly = application ? (application.status !== 'DRAFT' && application.status !== 'ON_HOLD' && !application.editRequested && !application.modificationNote) : false;

  // Allow navigation via steps only if application is submitted (not DRAFT)
  const canNavigate = application?.status && application.status !== 'DRAFT';

  const handleNext = React.useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sessionStorage.setItem('application_step', nextStep.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleBack = React.useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      sessionStorage.setItem('application_step', prevStep.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // If at step 0, allow exit to list
        onExit();
    }
  }, [currentStep, onExit]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProgramSelectionForm onContinue={handleNext} onBack={handleBack} readOnly={isReadOnly} />;
      case 1:
        return <ProgramRequirementForm onContinue={handleNext} onBack={handleBack} readOnly={isReadOnly} />;
      case 2:
        return <ApplicationReview onBack={handleBack} onExit={onExit} readOnly={isReadOnly} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] dark:bg-black animate-in fade-in duration-500 overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 border-t border-red-600">
        <div className="w-full px-2 sm:px-4 md:px-6 h-auto min-h-20 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
            <button onClick={onExit} className="p-2 md:p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-all text-zinc-500">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <h1 className="text-base md:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-red-600 shrink-0" />
              <span className="truncate">{application?.applicationNumber ? `Application ${application.applicationNumber}` : 'New Application'}</span>
            </h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isCompleted = currentStep > idx;

              return (
                <div 
                  key={step.id}
                  onClick={() => {
                    if (canNavigate) {
                      setCurrentStep(idx);
                      sessionStorage.setItem('application_step', idx.toString());
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700' : 'text-zinc-400'
                  } ${canNavigate ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900' : 'cursor-default'}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-red-600 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4">
             <div className="flex flex-col items-start sm:items-end">
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Progress</div>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-20 md:w-24 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-red-600 transition-all duration-500" 
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] md:text-xs font-black text-zinc-900 dark:text-zinc-50">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
                </div>
             </div>
             <div className="lg:hidden flex items-center gap-1.5">
                <div className="text-[10px] font-black uppercase text-zinc-400">Step</div>
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-black">
                    {currentStep + 1}
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="w-full px-2 sm:px-4 md:px-6 py-8 md:py-20">
        <div className="relative">
            {/* Subtle background decoration */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-80 -right-40 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 transition-all duration-500 ease-in-out">
                {renderStep()}
            </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAdmissionProfile, setApplication, Application } from '@/lib/features/admission/admissionSlice';
import { fetchFaculties, fetchPrograms } from '@/lib/features/academic/academicSlice';
import ApplicationList from '@/components/dashboard/application/ApplicationList';
import ApplicationWizard from '@/components/dashboard/application/ApplicationWizard';

export default function ApplicationPage() {
  const dispatch = useAppDispatch();
  const { applications, profileLoading } = useAppSelector((state) => state.admission);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'wizard'>('list');

  useEffect(() => {
    setMounted(true);
    const savedMode = sessionStorage.getItem('application_mode');
    if (savedMode === 'wizard') {
        setViewMode('wizard');
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchAdmissionProfile());
    dispatch(fetchFaculties());
    dispatch(fetchPrograms());
  }, [dispatch]);

  // Sync saved application ID with current state on refresh
  useEffect(() => {
    if (viewMode === 'wizard' && applications.length > 0) {
        const savedAppId = sessionStorage.getItem('application_id');
        if (savedAppId && savedAppId !== 'new') {
            const found = applications.find(a => a.id === savedAppId);
            if (found) {
                dispatch(setApplication(found));
            }
        }
    }
  }, [viewMode, applications, dispatch]);

  // Update saved ID whenever the active application changes (e.g. after initialization)
  const { application } = useAppSelector((state) => state.admission);
  useEffect(() => {
    if (viewMode === 'wizard' && application?.id) {
        sessionStorage.setItem('application_id', application.id);
    }
  }, [viewMode, application?.id]);

  const handleStartNew = () => {
    dispatch(setApplication(null)); // Clear active application for new one
    setViewMode('wizard');
    sessionStorage.setItem('application_mode', 'wizard');
    sessionStorage.setItem('application_id', 'new');
    // Reset step to 0 for new application
    sessionStorage.setItem('application_step', '0');
  };

  const handleContinue = (app: Application) => {
    dispatch(setApplication(app));
    setViewMode('wizard');
    sessionStorage.setItem('application_mode', 'wizard');
    sessionStorage.setItem('application_id', app.id);
    // Step is already managed by Wizard component reading sessionStorage
  };

  const handleExit = () => {
    setViewMode('list');
    sessionStorage.removeItem('application_mode');
    sessionStorage.removeItem('application_id');
    dispatch(setApplication(null)); // Clear active application on exit
    // We don't necessarily clear the step, so they can resume later if they click continue
  };

  if (profileLoading && applications.length === 0) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-black">
              <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
          </div>
      );
  }

  if (!mounted) {
      return null;
  }

  return (
    <>
        {viewMode === 'list' ? (
            <ApplicationList 
                onStartNew={handleStartNew} 
                onContinue={handleContinue} 
            />
        ) : (
            <ApplicationWizard 
                onExit={handleExit} 
            />
        )}
    </>
  );
}

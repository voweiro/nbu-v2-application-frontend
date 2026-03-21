'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProgramRequirements } from '@/lib/features/academic/academicSlice';
import { saveAcademicResults, uploadDocument, fetchAdmissionProfile } from '@/lib/features/admission/admissionSlice';
import { showAlert } from '@/lib/features/ui/uiSlice';
import { Loader2, Save, ArrowRight, ArrowLeft, Plus, Trash2, Upload, FileText, CheckCircle, GraduationCap, BookOpen, Sparkles, Files, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProgramRequirementFormProps {
  onContinue?: () => void;
  onBack?: () => void;
  readOnly?: boolean;
}

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 
  'Agricultural Science', 'Economics', 'Geography', 'Government', 'Literature in English',
  'Christian Religious Studies', 'Islamic Studies', 'Civic Education', 'Computer Studies'
];

export default function ProgramRequirementForm({ onContinue, onBack, readOnly = false }: ProgramRequirementFormProps) {
  const dispatch = useAppDispatch();
  const { application, loading: admissionLoading } = useAppSelector((state) => state.admission);
  const { currentRequirement, loading: academicLoading } = useAppSelector((state) => state.academic);

  // Parse specific requirements and determine effective requirements
  const specificReqs = React.useMemo(() => {
    if (!currentRequirement?.specificRequirements) return [];
    let reqs = [];
    try {
      reqs = typeof currentRequirement.specificRequirements === 'string' 
        ? JSON.parse(currentRequirement.specificRequirements) 
        : currentRequirement.specificRequirements;
    } catch {
      reqs = [];
    }
    
    // Normalize to objects if strings
    return Array.isArray(reqs) ? reqs.map((r) => {
        if (typeof r === 'string') return { name: r, type: 'TEXT' };
        if (r && typeof r === 'object' && 'name' in r) {
            const name = typeof (r as { name?: unknown }).name === 'string' ? (r as { name: string }).name : '';
            const type = typeof (r as { type?: unknown }).type === 'string' ? (r as { type: string }).type : 'TEXT';
            return { name, type };
        }
        return { name: '', type: 'TEXT' };
    }).filter(r => r.name) : [];
  }, [currentRequirement]);

  const extraDocs = React.useMemo(() => 
    specificReqs.filter((r) => r.type === 'DOCUMENT').map((r) => r.name),
  [specificReqs]);

  const textRequirements = React.useMemo(() => 
    specificReqs.filter((r) => r.type === 'TEXT'),
  [specificReqs]);

  const allRequiredDocs = React.useMemo(() => [
    ...(currentRequirement?.requiredDocuments || []),
    ...extraDocs
  ], [currentRequirement, extraDocs]);

  const showOLevel = (currentRequirement?.minOLevelCredits ?? 0) > 0;

  const [jambDetails, setJambDetails] = useState({
    regNumber: '',
    score: '',
    year: new Date().getFullYear().toString(),
    subjects: [{ subject: 'English Language', score: '' }, { subject: '', score: '' }, { subject: '', score: '' }, { subject: '', score: '' }]
  });

  const [oLevelResults, setOLevelResults] = useState<{
    id: string;
    examType: string;
    examYear: string;
    examNumber: string;
    schoolName: string;
    startDate: string;
    endDate: string;
    sittings: { id: string; subject: string; grade: string }[];
  }[]>([{
    id: '1',
    examType: 'WAEC',
    examYear: '',
    examNumber: '',
    schoolName: '',
    startDate: '',
    endDate: '',
    sittings: [
      { id: '0', subject: 'English Language', grade: '' },
      ...Array(4).fill(null).map((_, i) => ({ id: (i + 1).toString(), subject: '', grade: '' }))
    ]
  }]);

  const [transcriptDetails, setTranscriptDetails] = useState({
    institution: '',
    startDate: '',
    endDate: '',
    cgpa: '',
    maxCgpa: ''
  });

  const [textReqValues, setTextReqValues] = useState<Record<string, string>>({});

  // Load requirements when application is available
  useEffect(() => {
    if (application?.programmeId && application?.entryMode) {
      dispatch(fetchProgramRequirements({ 
        programId: application.programmeId, 
        entryMode: application.entryMode 
      }));
    }
  }, [application?.programmeId, application?.entryMode, dispatch]);

  // Pre-fill data if available in application.academicResults
  useEffect(() => {
    if (application?.academicResults && application.academicResults.length > 0) {
      const jamb = application.academicResults.find(r => r.resultType === 'JAMB');
      if (jamb && JSON.stringify(jamb.details) !== JSON.stringify(jambDetails)) {
        setJambDetails(jamb.details as any);
      }

      const olevels = application.academicResults.filter(r => r.resultType === 'O-LEVEL');
      if (olevels.length > 0) {
        const normalizedOlevels = olevels.map(r => {
          const d = r.details as any;
          return {
            id: r.id,
            ...d,
            schoolName: d?.schoolName || '',
            startDate: d?.startDate || '',
            endDate: d?.endDate || ''
          };
        });
        
        if (JSON.stringify(normalizedOlevels) !== JSON.stringify(oLevelResults)) {
            setOLevelResults(normalizedOlevels as any);
        }
      }

      const degree = application.academicResults.find(r => r.resultType === 'DEGREE');
      if (degree?.details) {
          const dd = degree.details as any;
          const newTranscript = {
              institution: dd.institution || '',
              startDate: dd.startDate || '',
              endDate: dd.endDate || '',
              cgpa: dd.cgpa || '',
              maxCgpa: dd.maxCgpa || ''
          };
          if (JSON.stringify(newTranscript) !== JSON.stringify(transcriptDetails)) {
              setTranscriptDetails(newTranscript);
          }
      }

      const otherReqs = application.academicResults.find(r => r.resultType === 'OTHER_REQUIREMENTS');
      if (otherReqs?.details && JSON.stringify(otherReqs.details) !== JSON.stringify(textReqValues)) {
          setTextReqValues(otherReqs.details as any);
      }
    }
  }, [application?.academicResults, jambDetails, oLevelResults, transcriptDetails, textReqValues]);

  const handleTextReqChange = (name: string, value: string) => {
      setTextReqValues(prev => ({ ...prev, [name]: value }));
  };

  const handleJambChange = (field: string, value: string) => {
    setJambDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleJambSubjectChange = (index: number, field: 'subject' | 'score', value: string) => {
    if (readOnly) return;
    
    // Prevent changing English Language subject
    if (index === 0 && field === 'subject' && value !== 'English Language') {
      return; 
    }

    if (field === 'score' && parseInt(value) > 100) {
      dispatch(showAlert({
        type: 'warning',
        title: 'Score Cap Exceeded',
        message: 'Individual subject scores cannot exceed the maximum value of 100.'
      }));
      return;
    }

    const newSubjects = [...jambDetails.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    
    // Calculate total score automatically
    const totalScore = newSubjects.reduce((sum, sub) => sum + (parseInt(sub.score) || 0), 0);
    
    if (totalScore > 400) {
      dispatch(showAlert({
        type: 'error',
        title: 'Score Tally Fault',
        message: 'The cumulative JAMB score cannot exceed the established limit of 400 points.'
      }));
      return;
    }

    setJambDetails(prev => ({ 
      ...prev, 
      subjects: newSubjects,
      score: totalScore.toString()
    }));
  };

  const handleOLevelChange = (index: number, field: string, value: string) => {
    const newResults = [...oLevelResults];
    newResults[index] = { ...newResults[index], [field]: value };
    setOLevelResults(newResults);
  };

  const handleSittingChange = (resIndex: number, sitIndex: number, field: 'subject' | 'grade', value: string) => {
    if (readOnly) return;

    // Prevent changing English Language subject
    if (sitIndex === 0 && field === 'subject' && value !== 'English Language') {
      return; 
    }

    const newResults = [...oLevelResults];
    newResults[resIndex].sittings[sitIndex] = { ...newResults[resIndex].sittings[sitIndex], [field]: value };
    setOLevelResults(newResults);
  };

  const addOLevelSitting = (resIndex: number) => {
    if (readOnly) return;
    const newResults = [...oLevelResults];
    newResults[resIndex].sittings.push({ 
      id: Date.now().toString(), 
      subject: '', 
      grade: '' 
    });
    setOLevelResults(newResults);
  };

  const removeOLevelSitting = (resIndex: number, sitIndex: number) => {
    if (readOnly) return;
    const newResults = [...oLevelResults];
    newResults[resIndex].sittings.splice(sitIndex, 1);
    setOLevelResults(newResults);
  };

  const addOLevelResult = () => {
    if (readOnly) return;
    if (oLevelResults.length >= 2) {
      dispatch(showAlert({
        type: 'warning',
        title: 'Sitting Capacity',
        message: 'The program regulations only permit a maximum of two O-Level sittings.'
      }));
      return;
    }
    setOLevelResults(prev => [...prev, {
      id: Date.now().toString(),
      examType: 'WAEC',
      examYear: '',
      examNumber: '',
      schoolName: '',
      startDate: '',
      endDate: '',
      sittings: [
        { id: '0', subject: 'English Language', grade: '' },
        ...Array(4).fill(null).map((_, i) => ({ id: (i + 1).toString(), subject: '', grade: '' }))
      ]
    }]);
  };

  const removeOLevelResult = (index: number) => {
    if (readOnly) return;
    setOLevelResults(prev => prev.filter((_, i) => i !== index));
  };

  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentName: string) => {
    if (readOnly) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingDocs(prev => ({ ...prev, [documentName]: true }));
      try {
        await dispatch(uploadDocument({ file, documentName, applicationId: application?.id })).unwrap();
        dispatch(showAlert({
          type: 'success',
          title: 'Document Archived',
          message: `The official copy of your ${documentName} has been successfully uploaded.`
        }));
        dispatch(fetchAdmissionProfile());
      } catch {
        dispatch(showAlert({
          type: 'error',
          title: 'Upload Breach',
          message: `The system failed to secure the ${documentName} transmission.`
        }));
      } finally {
        setUploadingDocs(prev => ({ ...prev, [documentName]: false }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) {
      if (onContinue) onContinue();
      return;
    }

    // Age Validation
    const dob = (application as any)?.applicant?.dateOfBirth || (application as any)?.profile?.dateOfBirth;
    if (dob) {
      const birthDate = new Date(dob);
      const currentYear = new Date().getFullYear();
      const cutoffDate = new Date(currentYear, 8, 30); // September 30th
      
      let age = cutoffDate.getFullYear() - birthDate.getFullYear();
      const m = cutoffDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && cutoffDate.getDate() < birthDate.getDate())) {
          age--;
      }

      if (age < 16) {
          dispatch(showAlert({
            type: 'error',
            title: 'Age Requirement',
            message: 'Candidate does not meet the minimum age protocol of 16 years by September 30th.'
          }));
          return;
      }
    }
    
    const results = [];

    // Process JAMB
    if (currentRequirement?.requiresJamb) {
      if (!jambDetails.regNumber || !jambDetails.score) {
        dispatch(showAlert({
          type: 'warning',
          title: 'Incomplete Dossier',
          message: 'Please provide all required JAMB examination parameters before proceeding.'
        }));
        return;
      }
      results.push({
        resultType: 'JAMB',
        institution: 'JAMB',
        year: parseInt(jambDetails.year),
        regNumber: jambDetails.regNumber,
        details: jambDetails
      });
    }

    // Process O-Level
    if (showOLevel && oLevelResults.length > 0) {
      for (const res of oLevelResults) {
        // Skip empty default sitting if it's the only one and not touched (optional check, but safer to enforce if shown)
        // If minOLevelCredits > 0, we assume they MUST provide results.
        
        if (!res.examNumber || !res.examYear || !res.schoolName) {
            dispatch(showAlert({
              type: 'warning',
              title: 'Validation Error',
              message: 'O-Level exam details and secondary school affiliation are mandatory requirements.'
            }));
            return;
        }
        results.push({
            resultType: 'O-LEVEL',
            institution: res.schoolName,
            year: parseInt(res.examYear),
            regNumber: res.examNumber,
            details: {
                examType: res.examType,
                examYear: res.examYear,
                examNumber: res.examNumber,
                schoolName: res.schoolName,
                startDate: res.startDate,
                endDate: res.endDate,
                sittings: res.sittings.filter(s => s.subject && s.grade)
            }
        });
      }
    }

    // Process Transcript / Degree
    if (currentRequirement?.requiresTranscript) {
        if (!transcriptDetails.institution || !transcriptDetails.startDate || !transcriptDetails.endDate || !transcriptDetails.cgpa) {
            dispatch(showAlert({
              type: 'warning',
              title: 'Educational Gaps',
              message: 'Submission failed. Detailed institutional background and CPGA metrics are required.'
            }));
            return;
        }
        results.push({
            resultType: 'DEGREE',
            institution: transcriptDetails.institution,
            year: parseInt(transcriptDetails.endDate.split('-')[0]) || new Date().getFullYear(),
            regNumber: 'N/A',
            details: {
                institution: transcriptDetails.institution,
                startDate: transcriptDetails.startDate,
                endDate: transcriptDetails.endDate,
                cgpa: transcriptDetails.cgpa,
                maxCgpa: transcriptDetails.maxCgpa
            }
        });
    }

    // Process Text Requirements
    if (textRequirements.length > 0) {
        const missing = textRequirements.filter((req) => !textReqValues[req.name]);
        if (missing.length > 0) {
            dispatch(showAlert({
              type: 'warning',
              title: 'Requirement Mismatch',
              message: `The following supplementary data is missing: ${missing.map((m) => m.name).join(', ')}`
            }));
            return;
        }
        results.push({
            resultType: 'OTHER_REQUIREMENTS',
            institution: 'N/A',
            year: new Date().getFullYear(),
            regNumber: 'N/A',
            details: textReqValues
        });
    }

    try {
      await dispatch(saveAcademicResults({ results, applicationId: application?.id })).unwrap();
      
      // Check required documents
      const uploadedDocs = application?.documents || [];
      
      const missingDocs = allRequiredDocs.filter((req: string) => 
        !uploadedDocs.some(up => up.documentName === req)
      );

      if (missingDocs.length > 0) {
        dispatch(showAlert({
          type: 'warning',
          title: 'Vault Deficiency',
          message: `Required documentation is missing: ${missingDocs.join(', ')}`
        }));
      }

      dispatch(showAlert({
        type: 'success',
        title: 'Academic Synchronized',
        message: 'Educational history and performance metrics have been securely committed to your profile.'
      }));
      if (onContinue) onContinue();

    } catch {
      dispatch(showAlert({
        type: 'error',
        title: 'Processing Fault',
        message: 'The registry failed to finalize the academic data commitment.'
      }));
    }
  };

  if (academicLoading && !currentRequirement) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Requirements...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 md:space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8 px-4 md:px-0">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3 md:gap-4">
            <FileText className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
            Academic Requirements
          </h2>
          <p className="text-sm md:text-base text-zinc-500 font-medium mt-2 max-w-lg">Provide your educational background and upload necessary credentials for validation.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 w-fit">
           <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
           <span className="text-[10px] md:text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Academic Phase</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* JAMB Section */}
        {currentRequirement?.requiresJamb && (
          <Card className="rounded-2xl md:rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 overflow-hidden">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">JAMB / UTME Details</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium">Enter your national examination registration and scores.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 py-6 sm:p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Registration Number</Label>
                  <Input 
                    value={jambDetails.regNumber} 
                    onChange={(e) => handleJambChange('regNumber', e.target.value)}
                    placeholder="e.g. 12345678AB"
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-red-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Exam Year</Label>
                  <Input 
                    type="number"
                    value={jambDetails.year} 
                    onChange={(e) => handleJambChange('year', e.target.value)}
                    placeholder="YYYY"
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-red-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Total Score</Label>
                  <div className="relative">
                    <Input 
                        type="number"
                        value={jambDetails.score} 
                        readOnly
                        disabled={readOnly}
                        placeholder="000"
                        className="rounded-xl h-12 bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed font-bold pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 uppercase">/ 400</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Subject Combination
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {jambDetails.subjects.map((sub, idx) => (
                          <div key={idx} className="flex gap-2 p-2 bg-zinc-50 rounded-2xl border border-zinc-100 items-center">
                              <Select 
                                value={sub.subject} 
                                onValueChange={(val) => handleJambSubjectChange(idx, 'subject', val)}
                                disabled={readOnly || (idx === 0 && sub.subject === 'English Language')}
                              >
                                  <SelectTrigger className="flex-1 bg-transparent border-none focus:ring-0 shadow-none font-bold">
                                      <SelectValue placeholder={`Subject ${idx + 1}`} />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl">
                                      {SUBJECTS.map(s => <SelectItem key={s} value={s} className="rounded-xl">{s}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <div className="w-px h-8 bg-zinc-200 mx-1" />
                              <Input 
                                  className="w-20 bg-transparent border-none focus:ring-0 shadow-none font-extrabold text-red-600 text-center disabled:opacity-70 disabled:cursor-not-allowed" 
                                  placeholder="00" 
                                  type="number"
                                  max={100}
                                  value={sub.score}
                                  onChange={(e) => handleJambSubjectChange(idx, 'score', e.target.value)}
                                  disabled={readOnly}
                              />
                          </div>
                      ))}
                  </div>
                </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Education / Transcript Section */}
        {currentRequirement?.requiresTranscript && (
        <Card className="rounded-2xl md:rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-800 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-100 shrink-0">
                  <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                  <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Institutional Background</CardTitle>
                  <CardDescription className="text-xs md:text-sm font-medium">Details of your previous degree or professional qualification.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 py-6 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             <div className="md:col-span-2 space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">University / Institution Name</Label>
                <Input 
                    value={transcriptDetails.institution}
                    onChange={(e) => setTranscriptDetails({...transcriptDetails, institution: e.target.value})}
                    placeholder="Search or enter institution name"
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-red-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                />
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Start Date</Label>
                <Input 
                    type="date"
                    value={transcriptDetails.startDate}
                    onChange={(e) => setTranscriptDetails({...transcriptDetails, startDate: e.target.value})}
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                />
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Graduation Date</Label>
                <Input 
                    type="date"
                    value={transcriptDetails.endDate}
                    onChange={(e) => setTranscriptDetails({...transcriptDetails, endDate: e.target.value})}
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                />
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Final CGPA</Label>
                <Input 
                    type="number"
                    step="0.01"
                    value={transcriptDetails.cgpa}
                    onChange={(e) => setTranscriptDetails({...transcriptDetails, cgpa: e.target.value})}
                    placeholder="e.g. 3.50"
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-red-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                />
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Grading Scale</Label>
                <Input 
                    type="number"
                    step="0.01"
                    value={transcriptDetails.maxCgpa}
                    onChange={(e) => setTranscriptDetails({...transcriptDetails, maxCgpa: e.target.value})}
                    placeholder="e.g. 5.00"
                    disabled={readOnly}
                    className="rounded-xl h-12 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-red-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                />
             </div>
          </CardContent>
        </Card>
        )}

        {/* O-Level Section */}
        {showOLevel && (
        <Card className="rounded-2xl md:rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-700 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-100 shrink-0">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">O-Level Results</CardTitle>
                <CardDescription className="text-xs md:text-sm font-medium">
                    {currentRequirement?.minOLevelCredits ? `Minimum ${currentRequirement.minOLevelCredits} credits including core subjects.` : 'Enter your secondary school credentials.'}
                </CardDescription>
              </div>
            </div>
            {oLevelResults.length < 2 && !readOnly && (
                <Button type="button" variant="outline" size="lg" onClick={addOLevelResult} className="rounded-2xl font-bold border-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-95 w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" /> Add Sitting
                </Button>
            )}
          </CardHeader>
          <CardContent className="px-2 py-6 sm:p-6 md:p-8 space-y-10">
            {oLevelResults.map((result, resIndex) => (
                <div key={result.id} className="p-6 md:p-8 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl bg-zinc-50/30 dark:bg-zinc-900/10 space-y-8 relative group/sitting transition-all hover:border-red-100 dark:hover:border-red-900/30">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 dark:text-zinc-700">Sitting #{resIndex + 1}</span>
                        {resIndex > 0 && !readOnly && (
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                onClick={() => removeOLevelResult(resIndex)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Exam Type</Label>
                            <Select 
                                value={result.examType} 
                                onValueChange={(val) => handleOLevelChange(resIndex, 'examType', val)}
                                disabled={readOnly}
                            >
                                <SelectTrigger className="rounded-xl h-12 bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="WAEC" className="rounded-xl">WAEC</SelectItem>
                                    <SelectItem value="NECO" className="rounded-xl">NECO</SelectItem>
                                    <SelectItem value="GCE" className="rounded-xl">GCE</SelectItem>
                                    <SelectItem value="NABTEB" className="rounded-xl">NABTEB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Year</Label>
                            <Input 
                                type="number"
                                value={result.examYear} 
                                onChange={(e) => handleOLevelChange(resIndex, 'examYear', e.target.value)}
                                placeholder="YYYY"
                                disabled={readOnly}
                                className="rounded-xl h-12 bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Number</Label>
                            <Input 
                                value={result.examNumber} 
                                onChange={(e) => handleOLevelChange(resIndex, 'examNumber', e.target.value)}
                                placeholder="Exam No."
                                disabled={readOnly}
                                className="rounded-xl h-12 bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-3 md:col-span-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">High School Name</Label>
                            <Input 
                                value={result.schoolName} 
                                onChange={(e) => handleOLevelChange(resIndex, 'schoolName', e.target.value)}
                                placeholder="Enter name of secondary school"
                                disabled={readOnly}
                                className="rounded-xl h-12 bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Subjects & Performance</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.sittings.map((sit, sitIndex) => (
                                <div key={sit.id} className="flex gap-2 items-center bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 shadow-sm group/subject hover:border-red-200 dark:hover:border-red-900 transition-all">
                                    <Select 
                                        value={sit.subject} 
                                        onValueChange={(val) => handleSittingChange(resIndex, sitIndex, 'subject', val)}
                                        disabled={readOnly || (sitIndex === 0 && sit.subject === 'English Language')}
                                    >
                                        <SelectTrigger className="flex-1 bg-transparent border-none focus:ring-0 shadow-none font-bold text-xs">
                                            <SelectValue placeholder="Subject" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {SUBJECTS.map(s => <SelectItem key={s} value={s} className="rounded-xl text-xs">{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
                                    <Select 
                                        value={sit.grade} 
                                        onValueChange={(val) => handleSittingChange(resIndex, sitIndex, 'grade', val)}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger className="w-[70px] bg-transparent border-none focus:ring-0 shadow-none font-black text-red-600">
                                            <SelectValue placeholder="G" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl min-w-[60px]">
                                            {GRADES.map(g => <SelectItem key={g} value={g} className="rounded-xl font-black">{g}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {!readOnly && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-zinc-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg shrink-0"
                                            onClick={() => removeOLevelSitting(resIndex, sitIndex)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {!readOnly && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="border-dashed border-2 rounded-2xl flex items-center justify-center text-zinc-400 font-bold hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/30 dark:hover:bg-red-900/10 h-11"
                                    onClick={() => addOLevelSitting(resIndex)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Subject
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
        )}

        {/* Additional Information */}
        {textRequirements.length > 0 && (
            <Card className="rounded-2xl md:rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 overflow-hidden">
                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 p-4 sm:p-6 md:p-8">
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Additional Information</CardTitle>
                    <CardDescription className="font-medium">Please provide the supplementary information required for this specific program.</CardDescription>
                </CardHeader>
                <CardContent className="px-2 py-6 sm:p-6 md:p-8 space-y-6">
                    {textRequirements.map((req, idx) => (
                        <div key={idx} className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{req.name}</Label>
                            <Input 
                                value={textReqValues[req.name] || ''}
                                onChange={(e) => handleTextReqChange(req.name, e.target.value)}
                                placeholder={`Enter ${req.name.toLowerCase()}`}
                                disabled={readOnly}
                                className="rounded-xl h-14 bg-zinc-50 border-zinc-200 focus:ring-4 focus:ring-blue-500/10 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        {/* Documents Section */}
        {allRequiredDocs.length > 0 && (
          <Card className="rounded-2xl md:rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 overflow-hidden">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900 p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                    <Files className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">Credential Uploads</CardTitle>
                    <CardDescription className="text-xs md:text-sm font-medium">Attach high-quality scanned copies of your original documents.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 py-6 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {allRequiredDocs.map((docName: string, idx: number) => {
                 const uploadedDoc = application?.documents?.find(d => d.documentName === docName);
                 const isUploaded = !!uploadedDoc;
                 const isUploading = uploadingDocs[docName];

                 return (
                    <div key={idx} className={`group flex flex-col p-6 border-2 rounded-3xl transition-all ${isUploaded ? 'bg-emerald-50/30 border-emerald-100 border-dashed dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-zinc-50/50 border-zinc-100 dark:bg-zinc-900/20 dark:border-zinc-800 hover:border-blue-100 dark:hover:border-blue-900'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isUploaded ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-red-500 group-hover:border-red-100 group-hover:bg-red-50 transition-all'}`}>
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : isUploaded ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                            </div>
                            {isUploaded && (
                                <a href={uploadedDoc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all">
                                    View
                                </a>
                            )}
                        </div>
                        <div className="space-y-1 mb-6">
                            <h4 className="font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">{docName}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                                {isUploaded ? 'Verified & Stored' : 'Select PDF or Image'}
                            </p>
                        </div>
                        <div className="mt-auto">
                            <input 
                                type="file" 
                                id={`doc-${idx}`} 
                                className="hidden" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, docName)}
                                disabled={isUploading || readOnly}
                            />
                            {!readOnly && (
                                <Label 
                                    htmlFor={`doc-${idx}`}
                                    className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer active:scale-95 ${isUploaded ? 'bg-emerald-100/50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-90 shadow-lg'}`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{isUploading ? 'Uploading...' : isUploaded ? 'Replace File' : 'Upload Document'}</span>
                                </Label>
                            )}
                        </div>
                    </div>
                 );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 md:pt-10 border-t border-zinc-100 dark:border-zinc-900">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={admissionLoading}
                className="h-14 md:h-16 px-6 md:px-10 rounded-2xl border-2 font-extrabold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Back
              </Button>
            )}

            {!readOnly && (
                <Button
                type="button"
                variant="outline"
                onClick={async (e) => {
                    e.preventDefault();
                    await handleSubmit(e);
                    dispatch(showAlert({
                      type: 'success',
                      title: 'Draft Archived',
                      message: 'Your current academic data has been successfully saved for later finalization.'
                    }));
                }}
                disabled={admissionLoading}
                className="h-14 md:h-16 px-6 md:px-10 rounded-2xl border-2 font-extrabold text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 active:scale-95 transition-all w-full sm:w-auto justify-center"
                >
                <Save className="w-5 h-5 mr-3" />
                Save as Draft
                </Button>
            )}

            <Button
              type="submit"
              disabled={admissionLoading}
              className="sm:ml-auto h-14 md:h-16 px-8 md:px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-2xl shadow-blue-600/30 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              {admissionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
              ) : readOnly ? (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-4" />
                </>
              ) : (
                <>
                  Save & Finalize
                  <ArrowRight className="w-5 h-5 ml-4" />
                </>
              )}
            </Button>
          </div>

      </form>
    </div>
  );
}

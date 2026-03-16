import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAdmissionProfile, uploadPassport, fetchAdmissionProfile, ApplicantProfile } from '@/lib/features/admission/admissionSlice';
import { fetchUser, User as AuthUser } from '@/lib/features/auth/authSlice';
import { showAlert } from '@/lib/features/ui/uiSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getFileUrl } from '@/lib/config';
import { 
  Loader2, 
  Camera, 
  User, 
  BadgeCheck, 
  Globe, 
  MapPin, 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  ShieldCheck 
} from "lucide-react";
import { COUNTRIES_DATA } from '@/lib/data/countries';
import { WORLD_LOCATIONS } from '@/lib/data/world-locations';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface BioDataFormProps {
  onContinue?: () => void;
  readOnly?: boolean;
}

const PHONE_CODES = [
  { value: '+234', label: 'Nigeria (+234)', key: 'NG' },
  { value: '+233', label: 'Ghana (+233)', key: 'GH' },
  { value: '+254', label: 'Kenya (+254)', key: 'KE' },
  { value: '+27', label: 'South Africa (+27)', key: 'ZA' },
  { value: '+1-US', label: 'United States (+1)', key: 'US' },
  { value: '+44', label: 'United Kingdom (+44)', key: 'GB' },
  { value: '+91', label: 'India (+91)', key: 'IN' },
  { value: '+1-CA', label: 'Canada (+1)', key: 'CA' },
].sort((a, b) => a.label.localeCompare(b.label));

const BioDataForm = ({ onContinue, readOnly = false }: BioDataFormProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile, loading: admissionLoading, error } = useAppSelector((state) => state.admission);
  const { user } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Consolidate normalization logic
  const prepData = React.useCallback((p: Partial<ApplicantProfile> | null | undefined, u: AuthUser | null | undefined): Partial<ApplicantProfile> => {
    const updates: Partial<ApplicantProfile> = {};
    
    if (u) {
        updates.firstName = u.firstName || '';
        updates.lastName = u.lastName || '';
        updates.middleName = u.middleName || '';
        updates.email = u.email || '';
    }

    if (p) {
        let gender = p.gender || '';
        if (gender) {
           const low = gender.trim().toLowerCase();
           if (low === 'm' || low === 'male') gender = 'Male';
           else if (low === 'f' || low === 'female') gender = 'Female';
           else gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        }

        let nationality = p.nationality || '';
        if (nationality) {
           const clean = nationality.trim();
           const exact = COUNTRIES_DATA.find(c => c.value.toLowerCase() === clean.toLowerCase());
           nationality = exact ? exact.value : clean;
        } else {
           nationality = 'Nigeria';
        }

        let stateVal = p.stateOfOrigin || '';
        if (stateVal && nationality.toLowerCase() === 'nigeria' && WORLD_LOCATIONS['Nigeria']) {
            const nigeriaStates = WORLD_LOCATIONS['Nigeria'].states;
            const exact = nigeriaStates.find(s => s.name.trim().toLowerCase() === stateVal.trim().toLowerCase());
            if (exact) {
                stateVal = exact.name;
            } else {
                const clean = stateVal.replace(/ State$/i, '').trim();
                const fuzzy = nigeriaStates.find(s => s.name.trim().toLowerCase() === clean.toLowerCase());
                if (fuzzy) stateVal = fuzzy.name;
            }
        }

        let dob = p.dateOfBirth || '';
        if (dob && dob.includes('T')) {
            try {
                dob = new Date(dob).toISOString().split('T')[0];
            } catch (e) {
                console.error("Date conversion failed", e);
            }
        }

        const phone = p.phone || (p as any).phoneNumber || u?.phone || '';

        Object.assign(updates, {
            ...p,
            gender,
            nationality,
            stateOfOrigin: stateVal,
            dateOfBirth: dob,
            phone
        });
    } else {
        updates.nationality = 'Nigeria';
    }

    return updates;
  }, []);

  const baseData = React.useMemo(() => prepData(profile, user), [prepData, profile, user]);
  const [draftData, setDraftData] = useState<Partial<ApplicantProfile>>({});
  const formData = React.useMemo(() => ({ ...baseData, ...draftData }), [baseData, draftData]);

  useEffect(() => {
    if (!profile && !admissionLoading) {
      dispatch(fetchAdmissionProfile());
    }
  }, [dispatch, profile, admissionLoading]);

  const countries = React.useMemo(() => COUNTRIES_DATA, []);
  const isNigeria = formData.nationality?.trim().toLowerCase() === 'nigeria';

  const states = React.useMemo(() => {
    if (!formData.nationality) return [];
    const countryKey = Object.keys(WORLD_LOCATIONS).find(k => k.trim().toLowerCase() === formData.nationality?.trim().toLowerCase());
    if (!countryKey) return [];
    const countryData = WORLD_LOCATIONS[countryKey];
    return countryData ? countryData.states.map(s => ({ value: s.name, label: s.name, key: s.name })) : [];
  }, [formData.nationality]);

  const lgas = React.useMemo(() => {
    if (!formData.nationality || !formData.stateOfOrigin) return [];
    const countryKey = Object.keys(WORLD_LOCATIONS).find(k => k.trim().toLowerCase() === formData.nationality?.trim().toLowerCase());
    if (!countryKey) return [];
    const countryData = WORLD_LOCATIONS[countryKey];
    if (countryData) {
        const stateData = countryData.states.find(s => s.name.trim().toLowerCase() === formData.stateOfOrigin?.trim().toLowerCase());
        if (stateData && stateData.lgas) {
            return stateData.lgas.map(lga => ({ value: lga, label: lga, key: lga }));
        }
    }
    return [];
  }, [formData.nationality, formData.stateOfOrigin]);

  const profilePhone = profile && 'phoneNumber' in profile ? (profile as { phoneNumber?: string }).phoneNumber : undefined;
  const resolvePhoneCode = (phone: string | undefined) => {
    if (phone && phone.startsWith('+')) {
      const match = PHONE_CODES.find(pc => phone.startsWith(pc.value.split('-')[0]));
      return match ? match.value : '+234';
    }
    return '+234';
  };
  const selectedPhoneCode = resolvePhoneCode((formData.phone || profilePhone || user?.phone || '') as string);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    setDraftData(prev => ({ ...prev, nationality: value, stateOfOrigin: '', lga: '' }));
  };

  const handleStateChange = (value: string) => {
    setDraftData(prev => ({ ...prev, stateOfOrigin: value, lga: '' }));
  };

  const handleLgaChange = (value: string) => {
    setDraftData(prev => ({ ...prev, lga: value }));
  };
  
  const handlePhoneCodeChange = (uniqueValue: string) => {
    const code = uniqueValue.split('-')[0];
    const current = formData.phone || '';
    const match = PHONE_CODES.find(pc => current.startsWith(pc.value.split('-')[0]));
    const rest = match ? current.slice(match.value.split('-')[0].length) : current.replace(/^\+\d+/, '');
    const normalizedRest = rest.trimStart();
    setDraftData(prev => ({ ...prev, phone: normalizedRest ? `${code}${normalizedRest}` : code }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // In multi-step, we might call this manually on "Save Progress"
    // The actual form submission happens on "Finalize"
    
    if (readOnly) {
      if (currentStep === totalSteps && onContinue) {
        onContinue();
      }
      return;
    }

    try {
      await dispatch(updateAdmissionProfile(formData)).unwrap();
      await dispatch(fetchUser());
      
      dispatch(showAlert({
        type: 'success',
        title: 'Archive Secured',
        message: 'Your progress has been successfully stored in our central repository.'
      }));
      
      if (currentStep === totalSteps && onContinue) {
        onContinue();
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const errorMessage = typeof err === 'string' ? err : (err.message || 'The system could not finalize the update protocol.');
      dispatch(showAlert({
        type: 'error',
        title: 'Registry Error',
        message: errorMessage
      }));
    }
  };

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await dispatch(uploadPassport(file));
    }
  };

  return (
    <div key={profile?.id || 'static-form'} className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-xl shadow-zinc-200/40 border border-zinc-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.25em]">
            <BadgeCheck className="w-4 h-4" />
            Bio-Data Integrity Protocol
          </div>
          <h1 className="text-3xl font-heading font-black text-brand-blue tracking-tight">Complete Profile</h1>
          <p className="text-zinc-500 font-bold text-sm tracking-wide">Step {currentStep} of {totalSteps}: {
            currentStep === 1 ? 'Personal Identity' : 
            currentStep === 2 ? 'Guardian Relations' : 
            'Next of Kin Protocols'
          }</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-4 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center gap-2.5">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-sm transition-all duration-500 shadow-md",
                    currentStep === step 
                      ? "bg-primary text-white scale-110 shadow-primary/30" 
                      : currentStep > step 
                        ? "bg-brand-blue text-white shadow-brand-blue/20" 
                        : "bg-white text-zinc-300 border border-zinc-200"
                  )}
                >
                  {currentStep > step ? <BadgeCheck className="w-5 h-5" /> : `0${step}`}
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-8 h-1 mx-2 rounded-full transition-all duration-700",
                    currentStep > step ? "bg-primary" : "bg-zinc-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Step 1: Personal Profile */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
            {/* Photo Upload Section */}
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-2xl shadow-zinc-200/30 overflow-hidden group">
              <CardHeader className="p-8 border-b border-zinc-50 bg-zinc-50/30 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-heading font-black text-brand-blue tracking-tight">Passport Photograph</CardTitle>
                  <CardDescription className="font-bold text-xs text-zinc-400 tracking-wider">OFFICIAL IDENTIFICATION IMAGE REQUIRED</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-10 flex flex-col items-center justify-center gap-6">
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 mb-2 border-2 border-zinc-200 dark:border-zinc-800 shadow-lg group-hover:border-primary transition-all duration-300">
                    {formData.passportUrl ? (
                      <Image
                        src={getFileUrl(formData.passportUrl)}
                        alt="Passport"
                        fill
                        sizes="128px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                        <User className="w-12 h-12 mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 cursor-pointer hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePassportUpload}
                      disabled={admissionLoading || readOnly}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Profile Picture</h4>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Required for Identification</p>
                </div>
              </CardContent>
            </Card>

            {/* Bio-Data Fields */}
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-2xl shadow-zinc-200/30">
              <CardHeader className="p-10 border-b border-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-heading font-black text-brand-blue tracking-tight">Personal Information</CardTitle>
                    <CardDescription className="font-bold text-sm tracking-wide text-zinc-500">Legal identification and location details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">First Name</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Last Name</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Middle Name</Label>
                    <Input
                      type="text"
                      name="middleName"
                      value={formData.middleName || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>
                  
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      readOnly
                      className="h-14 rounded-2xl border-zinc-200 bg-zinc-100 text-zinc-500 cursor-not-allowed font-bold text-sm px-6"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Phone Contact</Label>
                    <div className="flex group focus-within:ring-4 focus-within:ring-primary/10 rounded-2xl overflow-hidden border border-zinc-200 transition-all">
                      <div className="w-24 shrink-0 border-r border-zinc-200">
                          <Select value={selectedPhoneCode} onValueChange={handlePhoneCodeChange} disabled={readOnly}>
                              <SelectTrigger className="rounded-none h-14 bg-zinc-50/50 border-none focus:ring-0 shadow-none">
                                  <SelectValue placeholder="Code" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-2xl border-zinc-100">
                                  {PHONE_CODES.map(code => (
                                      <SelectItem key={code.key || code.value} value={code.value} className="rounded-xl font-bold p-3">{code.value}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <Input
                          type="tel"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleChange}
                          placeholder="800 000 0000"
                          disabled={readOnly}
                          className="flex-1 px-6 py-3 bg-zinc-50/50 focus:outline-none font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed border-none h-14"
                          required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Date of Birth</Label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Gender</Label>
                    <Select key={`gender-${formData.gender ? 'set' : 'empty'}`} value={formData.gender} onValueChange={(val) => setDraftData(prev => ({...prev, gender: val}))} disabled={readOnly}>
                      <SelectTrigger className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-zinc-100">
                        <SelectItem value="Male" className="rounded-xl font-bold p-3">Male</SelectItem>
                        <SelectItem value="Female" className="rounded-xl font-bold p-3">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nationality</Label>
                    <Select key={`country-${formData.nationality}-${countries.length}`} value={formData.nationality} onValueChange={handleCountryChange} disabled={readOnly}>
                      <SelectTrigger className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-zinc-400" />
                          <SelectValue placeholder="Select Country" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl max-h-[300px] shadow-2xl border-zinc-100">
                        {countries.map(country => (
                          <SelectItem key={country.key || country.value} value={country.value} className="rounded-xl font-bold p-3">{country.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isNigeria && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">State of Origin</Label>
                        <Select key={`state-${formData.stateOfOrigin}-${states.length}`} value={formData.stateOfOrigin} onValueChange={handleStateChange} disabled={readOnly}>
                          <SelectTrigger className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-zinc-400" />
                              <SelectValue placeholder="Select State" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl max-h-[300px] shadow-2xl border-zinc-100">
                            {states.map(state => (
                              <SelectItem key={state.key || state.value} value={state.value} className="rounded-xl font-bold p-3">{state.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">LGA</Label>
                        <Select key={`lga-${formData.lga}-${lgas.length}`} value={formData.lga} onValueChange={handleLgaChange} disabled={readOnly}>
                          <SelectTrigger className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-zinc-400" />
                              <SelectValue placeholder="Select LGA" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl max-h-[300px] shadow-2xl border-zinc-100">
                            {lgas.map(lga => (
                              <SelectItem key={lga.key || lga.value} value={lga.value} className="rounded-xl font-bold p-3">{lga.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Residential Address</Label>
                  <Textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="min-h-[120px] rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm p-6 resize-none"
                    placeholder="House Number, Street Name, City, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Guardian Info */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-2xl shadow-zinc-200/30">
              <CardHeader className="p-10 border-b border-zinc-50 bg-zinc-50/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-heading font-black text-brand-blue tracking-tight">Guardian Information</CardTitle>
                    <CardDescription className="font-bold text-sm tracking-wide text-zinc-500">Contact details for parent or legal guardian</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Guardian Full Name</Label>
                    <Input
                      placeholder="As per legal documentation"
                      name="nameOfGuardian"
                      value={formData.nameOfGuardian || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Guardian Phone</Label>
                    <Input
                      type="tel"
                      placeholder="+234 ..."
                      name="guardianPhone"
                      value={formData.guardianPhone || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Guardian Email</Label>
                    <Input
                      type="email"
                      placeholder="address@example.com"
                      name="guardianEmail"
                      value={formData.guardianEmail || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Next of Kin */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-2xl shadow-zinc-200/30">
              <CardHeader className="p-10 border-b border-zinc-50 bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-heading font-black text-brand-blue tracking-tight">Next of Kin Protocol</CardTitle>
                    <CardDescription className="font-bold text-sm tracking-wide text-zinc-500">Emergency contact and kinship verification</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</Label>
                    <Input
                      placeholder="Next of kin full name"
                      name="nextOfKin"
                      value={formData.nextOfKin || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Relationship</Label>
                    <Input
                      placeholder="e.g. Mother, Father, Brother"
                      name="nextOfKinRelationship"
                      value={formData.nextOfKinRelationship || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Contact Phone</Label>
                    <Input
                      type="tel"
                      placeholder="+234 ..."
                      name="nextOfKinPhone"
                      value={formData.nextOfKinPhone || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Contact Email</Label>
                    <Input
                      type="email"
                      placeholder="address@example.com"
                      name="nextOfKinEmail"
                      value={formData.nextOfKinEmail || ''}
                      onChange={handleChange}
                      className="h-14 rounded-2xl border-zinc-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm px-6"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          {currentStep > 1 ? (
            <Button 
              type="button" 
              onClick={prevStep}
              variant="outline"
              className="h-14 px-8 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-50 border-zinc-100 flex items-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Previous Protocol
            </Button>
          ) : <div />}
          
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSubmit()} // Save current state
              className="h-14 px-8 rounded-2xl border-2 font-black text-xs uppercase tracking-widest text-[#1e3a8a] border-[#1e3a8a]/10 hover:bg-[#1e3a8a]/5 transition-all hidden md:flex"
              disabled={admissionLoading}
            >
              {admissionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : <Save className="w-4 h-4 mr-2" />}
              Save Progress
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="h-14 px-10 rounded-2xl bg-brand-blue text-white hover:bg-brand-blue/90 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-blue/20 flex items-center gap-3 group"
              >
                Continue Protocol
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button 
                type="submit"
                className="h-14 px-12 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 group"
                disabled={admissionLoading}
              >
                {admissionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <>
                    {readOnly ? 'Finish Review' : 'Finalize & Commit'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BioDataForm;

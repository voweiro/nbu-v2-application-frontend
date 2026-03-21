'use client';

import { useAppSelector } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Bell, Clock, CheckCircle2, AlertCircle, ArrowRight, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { applications } = useAppSelector((state) => state.admission);

  const inProgress = applications.filter(app => app.status === 'DRAFT').length;
  const submitted = applications.filter(app => app.status !== 'DRAFT').length;
  // Action required if edit is requested (by applicant) OR if there is a modification note (requested by officer)
  const actionRequired = applications.filter(app => app.modificationNote).length;

  const stats = [
    { title: 'In Progress', value: inProgress.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Submitted', value: submitted.toString(), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Action Required', value: actionRequired.toString(), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
      {/* Welcome Section */}
      <section className="relative overflow-hidden p-6 sm:p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-brand-blue via-[#1e40af] to-[#1e3a8a] text-white shadow-2xl shadow-brand-blue/30 border border-white/10">
        <div className="absolute top-0 right-0 p-8 sm:p-16 opacity-10 transform translate-x-1/4 -translate-y-1/4 group transition-transform duration-700 hover:scale-110">
          <Zap className="w-40 sm:w-80 h-40 sm:h-80" />
        </div>
        <div className="absolute -bottom-24 -left-24 w-32 sm:w-64 h-32 sm:h-64 bg-primary/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-100/60">Institutional Portal Alpha</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Welcome, {user?.firstName || 'Applicant'}!
          </h1>
          <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Your journey towards academic excellence begins here. Track your progress, manage dossiers, and stay connected with the university.
          </p>
          
          <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/dashboard/application">
              <Button className="bg-primary text-white hover:bg-primary/90 font-black px-8 h-14 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 group border-0 text-sm uppercase tracking-widest">
                <Plus className="w-5 h-5 mr-3" />
                Initialize Application
                <ArrowRight className="w-5 h-5 ml-3 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-xl px-8 h-14 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest">
              Review Protocols
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
          <Card key={stat.title} className={`bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-zinc-200/60 transition-all duration-500 rounded-[2rem] group overflow-hidden border-b-8 ${
            stat.title === 'Action Required' ? 'hover:border-primary' : 'hover:border-brand-blue'
          } animate-in fade-in slide-in-from-bottom-10`} style={{ animationDelay: `${idx * 150}ms` }}>
            <CardContent className="p-6 md:p-8 flex items-center justify-between relative">
              <div className="relative z-10 text-left">
                <p className="text-[10px] md:text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 md:mb-3">
                  {stat.title}
                </p>
                <h3 className="text-3xl md:text-4xl font-heading font-black text-brand-blue dark:text-zinc-50 tracking-tight">
                  {stat.value}
                </h3>
              </div>
              <div className={`${stat.bg} p-4 md:p-5 rounded-3xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg ${
                stat.title === 'Action Required' ? 'shadow-red-500/10' : 'shadow-brand-blue/10'
              }`}>
                <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 opacity-50" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/30 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 md:p-10 border-b border-zinc-50 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl font-heading font-black text-brand-blue">Recent Dossiers</CardTitle>
                <CardDescription className="text-zinc-500 font-bold mt-1 text-xs md:sm tracking-wide">Registry records and processing status</CardDescription>
              </div>
              <Button variant="ghost" className="w-full sm:w-auto text-primary hover:bg-primary/5 px-4 h-10 md:h-auto font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-105 border border-primary/10 sm:border-0">
                Full Registry
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <Link href="/dashboard/application" key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group border border-transparent hover:border-zinc-100 active:scale-[0.99] gap-4">
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shrink-0 ${
                            app.status === 'DRAFT' ? 'bg-amber-50 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-green-50 text-green-500 shadow-lg shadow-green-500/10'
                          }`}>
                             <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-base sm:text-lg font-black text-brand-blue dark:text-zinc-50 tracking-tight truncate">{app.applicationNumber}</h4>
                             <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest truncate">{app.session?.academicSessionName || 'Sess-01'} • {app.entryMode || 'UTME'}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                              app.status === 'DRAFT' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                              app.status === 'ADMITTED' ? 'bg-green-50 border-green-100 text-green-600' : 
                              'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>
                              {app.status.replace('_', ' ')}
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-zinc-100 flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-all sm:-translate-x-4 group-hover:translate-x-0">
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                       </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                  <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-700 animate-pulse">
                    <Zap className="w-10 h-10 text-zinc-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-black text-brand-blue dark:text-zinc-50">Empty Registry</h4>
                    <p className="text-sm font-bold text-zinc-400 max-w-[280px] mt-2 mx-auto leading-relaxed">
                      Initialize your first application Dossier to begin the institutional intake protocol.
                    </p>
                  </div>
                  <Link href="/dashboard/application">
                    <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest px-8 border-2 hover:bg-zinc-50 transition-all active:scale-95 text-brand-blue border-zinc-100">
                      Begin Setup
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/30 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 md:p-8 border-b border-zinc-50 dark:border-zinc-800 flex flex-row items-center justify-between">
              <CardTitle className="text-lg md:text-xl font-heading font-black text-brand-blue">Bulletin</CardTitle>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-brand-blue" />
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6 md:space-y-8">
                 <div className="flex flex-col items-center justify-center py-10 md:py-16 text-center animate-in zoom-in-95 duration-700">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-zinc-50 flex items-center justify-center mb-4 md:mb-6 shadow-sm border border-zinc-100">
                       <Bell className="w-5 h-5 md:w-7 md:h-7 text-zinc-200" />
                    </div>
                    <p className="text-[10px] md:text-sm font-black text-zinc-400 uppercase tracking-widest">Static Signal</p>
                    <p className="text-[9px] md:text-xs font-bold text-zinc-400 mt-1 md:mt-2">No incoming communications</p>
                 </div>
              </div>
              <Button variant="ghost" className="w-full mt-6 md:mt-10 text-zinc-400 hover:text-brand-blue dark:hover:text-zinc-200 text-[10px] font-black uppercase tracking-[0.25em] border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl py-6 md:py-8 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-brand-blue/30 group">
                <ShieldCheck className="w-4 h-4 mr-2 text-zinc-300 group-hover:text-primary transition-colors" />
                Dossier Health Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
}

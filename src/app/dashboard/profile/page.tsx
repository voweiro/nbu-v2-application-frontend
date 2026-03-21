'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { User, Shield, Smartphone, Key, Camera, BadgeCheck } from 'lucide-react';
import BioDataForm from '@/components/dashboard/application/BioDataForm';
import SecurityForm from '@/components/dashboard/profile/SecurityForm';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="relative h-48 rounded-3xl bg-gradient-to-r from-red-600 to-red-800 overflow-hidden shadow-xl shadow-red-500/10">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl animate-pulse" />
        <div className="absolute bottom-6 left-8 flex items-end gap-6 z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-extrabold text-3xl border-2 border-red-100">
                {user?.firstName?.[0] || 'A'}
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <BadgeCheck className="w-5 h-5 text-red-200" />
            </div>
            <p className="text-red-100/80 font-medium">{user?.userType || 'APPLICANT'}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Left Column - Navigation */}
        <div className="md:col-span-1 space-y-4">
          {[
            { id: 'general', label: 'General Information', icon: User },
            { id: 'security', label: 'Security & Password', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Smartphone },
            { id: 'privacy', label: 'Privacy Settings', icon: Key },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                activeTab === item.id
                  ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm text-red-600" 
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-3">
            {activeTab === 'general' && <BioDataForm />}
            {activeTab === 'security' && <SecurityForm />}
            {(activeTab === 'notifications' || activeTab === 'privacy') && (
              <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                   <Key className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Coming Soon</h3>
                <p className="text-sm text-zinc-500 font-medium mt-1">This section is currently under development</p>
              </div>
            )}
        </div>
      </div>
      </div>
    </div>
  );
}

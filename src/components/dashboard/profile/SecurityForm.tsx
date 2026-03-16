'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { updatePassword } from '@/lib/features/auth/authSlice';
import { showAlert } from '@/lib/features/ui/uiSlice';
import { Shield, Key, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SecurityForm = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      dispatch(showAlert({
        type: 'warning',
        title: 'Mismatched Credentials',
        message: 'The new password and confirmation entries do not correspond.'
      }));
      return;
    }

    if (formData.newPassword.length < 8) {
      dispatch(showAlert({
        type: 'error',
        title: 'Security Compliance',
        message: 'Password must meet the minimum requirement of 8 characters.'
      }));
      return;
    }

    setLoading(true);
    try {
      await dispatch(updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })).unwrap();
      
      dispatch(showAlert({
        type: 'success',
        title: 'Security Refreshed',
        message: 'Your authentication credentials have been successfully updated.'
      }));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'The system failed to synchronize the new security parameters.');
      dispatch(showAlert({
        type: 'error',
        title: 'Update Interrupted',
        message: message
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Security & Password</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Manage your account security and authentication</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800">
          <Shield className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Account Protection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Protection Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[24px] border border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-50">Password Requirements</h4>
            <ul className="space-y-3">
              {[
                'Minimum 8 characters',
                'At least one uppercase letter',
                'At least one number',
                'At least one special character'
              ].map((req, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[24px] border border-red-100 dark:border-red-800/50 flex gap-4">
             <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
             <p className="text-xs font-medium text-red-700 dark:text-red-500 leading-relaxed">
               Changing your password will not log you out of your current session, but other devices will be required to log in again.
             </p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Current Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-medium transition-all text-sm"
                  />
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-900" />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-medium transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Updating Security...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecurityForm;

'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { fetchUser } from '@/lib/features/auth/authSlice'
import { fetchAdmissionProfile } from '@/lib/features/admission/admissionSlice'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.admission)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()

  const initAuthRef = useRef(false)
  useEffect(() => {
    if (initAuthRef.current) return
    initAuthRef.current = true

    if (!isAuthenticated && !user) {
      dispatch(fetchUser())
        .unwrap()
        .then(() => {
          dispatch(fetchAdmissionProfile())
        })
        .catch(() => {
          router.push('/')
        })
    } else if (!profile) {
      dispatch(fetchAdmissionProfile())
    }
  }, [isAuthenticated, user, profile, router, dispatch])

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check profile completion and redirect
  useEffect(() => {
    if (user && profile && pathname !== '/dashboard/profile') {
      // Check for essential fields
      const isProfileComplete = 
        profile.dateOfBirth && 
        profile.nationality && 
        profile.address && 
        profile.nextOfKin &&
        // Only require State/LGA if nationality is Nigeria
        (profile.nationality !== 'Nigeria' || (profile.stateOfOrigin && profile.lga));

      if (!isProfileComplete) {
        router.push('/dashboard/profile');
      }
    }
  }, [user, profile, pathname, router]);

  if (!isAuthenticated && !user && typeof window !== 'undefined') {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileMenuOpen}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
        
        <footer className="px-8 py-6 border-t border-zinc-200 bg-white text-zinc-400 text-[10px] tracking-wider uppercase font-bold text-center lg:text-left z-10 shrink-0">
          © 2026 NBU-NET Systems • Student Application Portal • v1.0.4
        </footer>
      </div>
    </div>
  )
}

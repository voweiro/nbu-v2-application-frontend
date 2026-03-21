'use client'

import { Bell, Menu, Calendar } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'

interface HeaderProps {
  onMobileMenuToggle?: () => void
  contextTitle?: string
}

export function Header({ onMobileMenuToggle, contextTitle }: HeaderProps) {
  const pathname = usePathname()
  const { user } = useAppSelector((state) => state.auth)

  // Derive title from pathname
  const getPageTitle = (path: string) => {
    if (contextTitle) return contextTitle
    if (path === '/dashboard') return 'Intelligence Overview'
    if (path === '/dashboard/application') return 'Application Dossier'
    if (path === '/dashboard/profile') return 'Applicant Profile'
    if (path === '/dashboard/fees') return 'Financial Records'
    if (path === '/dashboard/messages') return 'Communications'
    return 'Portal Node'
  }

  return (
    <header className="h-16 md:h-24 bg-white z-40 w-full transition-all duration-500 border-b-2 border-primary flex-shrink-0 relative overflow-hidden flex items-center shadow-md">
      <div className="w-full px-3 md:px-12 flex items-center justify-between gap-2 md:gap-6 relative z-10">
        {/* LEFT: MENU & TITLE */}
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={onMobileMenuToggle}
            className="p-2 md:p-3 hover:bg-zinc-50 rounded-2xl transition-all lg:hidden active:scale-90 border border-transparent hover:border-zinc-200 shrink-0"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7 text-brand-blue" />
          </button>

          <div className="flex items-center gap-2 md:gap-6 min-w-0">
            {/* Institutional Logo - Hidden on mobile to save space */}
            <div className="hidden md:block w-10 h-10 md:w-12 md:h-12 relative flex-shrink-0">
              <img src="/logo.png" alt="University Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col min-w-0 py-1">
              <div className="hidden sm:flex items-center gap-2 text-zinc-600 font-extrabold uppercase text-[8px] md:text-[10px] tracking-[0.25em]">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Applicant Ops
              </div>
              <h2 className="text-base md:text-3xl font-heading font-black tracking-tight text-brand-blue leading-tight truncate">
                {getPageTitle(pathname)}
              </h2>
              <span className="hidden md:block text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-1">Institutional Intelligence System</span>
            </div>
          </div>
        </div>

        {/* RIGHT: USER ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 bg-zinc-50/80 p-1 md:px-4 md:py-2 rounded-2xl border border-zinc-100 group transition-all hover:bg-white hover:shadow-lg hover:shadow-zinc-200/20 cursor-default">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-black uppercase tracking-widest text-brand-blue leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 leading-tight mt-1.5 font-heading">
                  Dossier ID: {user?.id?.slice(0, 8).toUpperCase() || '---'}
              </p>
            </div>
            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-heading font-black text-[10px] md:text-xs shadow-xl shadow-brand-blue/20 transform group-hover:scale-105 transition-all">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
          </div>

          <button className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-brand-blue hover:bg-zinc-50 hover:border-primary transition-all relative group shadow-sm shrink-0">
            <Bell className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-primary rounded-full border-2 border-white shadow-lg animate-bounce" />
          </button>
        </div>
      </div>
    </header>
  )
}

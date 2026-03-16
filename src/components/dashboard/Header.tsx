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
    <header className="h-24 bg-white z-40 w-full transition-all duration-500 border-b-2 border-primary flex-shrink-0 relative overflow-hidden flex items-center shadow-md">
      <div className="w-full px-6 md:px-12 flex items-center justify-between gap-6 relative z-10">
        {/* LEFT: LOGO & DYNAMIC CONTEXT */}
        <div className="flex items-center gap-6 flex-1">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={onMobileMenuToggle}
            className="p-3 -ml-3 hover:bg-zinc-50 rounded-2xl transition-all lg:hidden active:scale-90 border border-transparent hover:border-zinc-200"
          >
            <Menu className="w-7 h-7 text-brand-blue" />
          </button>

          <div className="flex items-center gap-6">
            {/* Institutional Logo - Compact size */}
            <div className="w-12 h-12 relative flex-shrink-0">
              <img src="/logo.png" alt="University Logo" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col min-w-0 py-1">
              <div className="flex items-center gap-2 text-zinc-600 font-extrabold uppercase text-[10px] tracking-[0.25em]">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Applicant Operations Node
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-brand-blue leading-tight mb-0.5">
                {getPageTitle(pathname)}
              </h2>
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-1">Institutional Intelligence System</span>
            </div>
          </div>
        </div>

        {/* RIGHT: SESSION & USER ACTIONS */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-zinc-50/80 px-4 py-2 rounded-2xl border border-zinc-100 group transition-all hover:bg-white hover:shadow-lg hover:shadow-zinc-200/20 cursor-default">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-xs font-black uppercase tracking-widest text-brand-blue leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 leading-tight mt-1.5 font-heading">
                   Dossier ID: {user?.id?.slice(0, 8).toUpperCase() || '---'}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-heading font-black text-xs shadow-xl shadow-brand-blue/20 transform group-hover:scale-105 transition-all">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
            </div>

            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-brand-blue hover:bg-zinc-50 hover:border-primary transition-all relative group shadow-sm">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white shadow-lg animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

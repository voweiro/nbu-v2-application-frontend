'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { LayoutDashboard, User, FileText, LogOut, MessageSquare, Banknote, ChevronLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { logout } from '@/lib/features/auth/authSlice'

const sidebarItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Applications',
    href: '/dashboard/application',
    icon: FileText,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'My Fees',
    href: '/dashboard/fees',
    icon: Banknote,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
]

interface SidebarProps {
  isCollapsed?: boolean
  isMobileOpen?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function Sidebar({ isCollapsed = false, isMobileOpen = false, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div 
        className={cn(
          "fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-500",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed lg:relative h-full bg-brand-blue transition-all duration-500 flex flex-col z-[70] lg:z-20 shadow-2xl border-r border-white/5 shrink-0",
          isCollapsed ? "lg:w-24" : "lg:w-72",
          isMobileOpen ? "translate-x-0 w-80" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* BRANDING SECTION */}
        <div className={cn(
          "h-28 flex flex-col justify-center transition-all duration-500 border-b border-white/10 shrink-0",
          isCollapsed ? "items-center px-0" : "px-8"
        )}>
          {!isCollapsed ? (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.25em] text-blue-100/60 uppercase">Applicant Portal</span>
              </div>
              <h1 className="font-heading font-black text-xl tracking-tight text-white leading-tight">
                NBU Network
              </h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/40 mt-1.5">Intellectual Gateway</p>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="font-heading font-black text-white text-2xl tracking-tighter">NBU</span>
            </div>
          )}
        </div>

        {/* TOGGLE BUTTON - Desktop Only */}
        <button 
          onClick={onToggle}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-2xl flex items-center justify-center text-brand-blue hover:text-primary transition-all z-[80] group active:scale-90 hidden lg:flex",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* NAVIGATION SECTION */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <nav className={cn(
            "flex-1 space-y-2 overflow-y-auto custom-scrollbar-white pt-10 focus:outline-none",
            isCollapsed ? "px-3" : "px-0"
          )}>
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={isCollapsed ? item.title : ""}
                  className={cn(
                    "group relative flex items-center transition-all duration-300 mx-4",
                    isCollapsed ? "justify-center h-14 w-14 rounded-2xl mx-auto mb-4" : "py-4 px-6 rounded-2xl mb-2 mr-4 ml-0",
                    isActive 
                      ? "bg-primary text-white shadow-xl shadow-primary/30 active-link-glow" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn("relative z-10 flex items-center w-full", isCollapsed ? "justify-center" : "gap-5")}>
                    <div className={cn(
                      "w-5 h-5 flex items-center justify-center transition-all duration-300",
                      isActive ? "scale-110" : "group-hover:translate-x-0.5"
                    )}>
                      <Icon strokeWidth={isActive ? 3 : 2} className="w-full h-full" />
                    </div>
                    <span className={cn(
                      "text-[13px] font-bold tracking-wide shrink-0 transition-all duration-300",
                      isCollapsed ? "lg:opacity-0 lg:hidden" : "opacity-100",
                      isActive ? "font-black" : "group-hover:translate-x-1"
                    )}>
                      {item.title}
                    </span>
                  </div>

                  {isCollapsed && isActive && (
                    <div className="absolute inset-0 bg-primary rounded-2xl -z-10 lg:block hidden shadow-lg shadow-primary/40" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* FOOTER SECTION: USER CONTEXT */}
          <div className={cn("mt-auto pb-12 border-t border-white/5 flex-shrink-0", isCollapsed ? "lg:p-4 p-6" : "p-8")}>
            <div className={cn(
              "flex items-center transition-all duration-500",
              isCollapsed ? "lg:flex-col lg:gap-8 gap-5" : "gap-5"
            )}>
              <div className="group relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white/20 cursor-pointer overflow-hidden shadow-lg">
                  {user?.displayPic ? (
                    <Image src={user.displayPic as string} alt="Profile" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-heading font-black text-xs">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-brand-blue rounded-full shadow-lg" />
              </div>

              <div className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                isCollapsed ? "lg:opacity-0 lg:hidden" : "opacity-100"
              )}>
                <p className="text-xs font-black uppercase text-white tracking-widest truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[9px] font-bold uppercase text-white/30 tracking-[0.25em] mt-2 truncate">
                   Security Authorized
                </p>
              </div>

              <button 
                onClick={handleLogout}
                className={cn(
                  "text-white/30 hover:text-red-400 transition-all active:scale-90 flex-shrink-0 hover:rotate-12",
                  isCollapsed ? "lg:p-1" : ""
                )}
                title="Secure Sign Out"
              >
                <LogOut className={isCollapsed ? "lg:w-7 lg:h-7 w-6 h-6" : "w-6 h-6"} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

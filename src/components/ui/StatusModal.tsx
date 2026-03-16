'use client'

import React from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { hideAlert } from '@/lib/features/ui/uiSlice'
import { Button } from './button'

const icons = {
  success: <CheckCircle2 className="w-12 h-12 text-emerald-500" />,
  error: <XCircle className="w-12 h-12 text-rose-500" />,
  info: <Info className="w-12 h-12 text-blue-500" />,
  warning: <AlertTriangle className="w-12 h-12 text-amber-500" />,
}

const colors = {
  success: 'border-emerald-100 bg-emerald-50/30',
  error: 'border-rose-100 bg-rose-50/30',
  info: 'border-blue-100 bg-blue-50/30',
  warning: 'border-amber-100 bg-amber-50/30',
}

export function StatusModal() {
  const dispatch = useAppDispatch()
  const { isOpen, type, title, message, onClose } = useAppSelector((state) => state.ui)

  if (!isOpen) return null

  const handleClose = () => {
    dispatch(hideAlert())
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative max-w-sm w-full bg-white dark:bg-zinc-950 border rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${colors[type]}`}>
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
            {icons[type]}
          </div>
          
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
            {title}
          </h2>
          
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
            {message}
          </p>

          <Button 
            onClick={handleClose}
            className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  )
}

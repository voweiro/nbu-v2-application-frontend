'use client'
import { Fee } from '@/lib/features/payment/paymentSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, FileText, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  fee?: Fee
  percent?: number
  amount?: number
  reference?: string
  isBalance?: boolean
  onCancel: () => void
  onConfirm: (url?: string) => void
  paymentUrl?: string
};

export default function ConfirmPaymentModal({ open, fee, percent, amount, reference, isBalance, onCancel, onConfirm, paymentUrl }: Props) {
  if (!open || !fee) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <Card className="relative z-50 w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Confirm Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{fee.name}</div>
              <div className="text-xs text-zinc-500">{isBalance ? 'Balance Payment' : `Selected ${percent}%`}</div>
            </div>
            <div className="text-lg font-black">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: fee.currency || 'NGN' }).format(Number(amount || 0))}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reference</div>
              <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{reference || 'Pending'}</div>
            </div>
            <div className={cn("p-3 rounded-xl border", paymentUrl ? "bg-emerald-50 border-emerald-200" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800")}>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Gateway Link</div>
              <div className="text-xs truncate">{paymentUrl ? 'Ready' : 'Preparing'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onConfirm(paymentUrl)} disabled={!paymentUrl}>
              <FileText className="w-4 h-4 mr-2" />
              Proceed to Gateway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

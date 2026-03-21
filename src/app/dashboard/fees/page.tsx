'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useSearchParams, useRouter } from 'next/navigation'

import { buildPaymentUrl } from '@/lib/config'
import api from '@/lib/api'
import { fetchMyPayments, initiatePayment, verifyPayment, clearPaymentUrl, clearError, resetVerificationStatus, Fee } from '@/lib/features/payment/paymentSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle2, CreditCard, History, Banknote, Calendar, FileText, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ConfirmPaymentModal from '@/components/dashboard/fees/ConfirmPaymentModal'

import { Suspense } from 'react'

function FeesContent() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { fees, payments, loading, actionLoading, error, verificationStatus } = useAppSelector((state) => state.payment)
  const { application, applications, profile } = useAppSelector((state) => state.admission)
  const { faculties, programs } = useAppSelector((state) => state.academic)
  const { user } = useAppSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees')
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [applicableFees, setApplicableFees] = useState<Fee[]>([])
  const [percentByFee, setPercentByFee] = useState<Record<string, number>>({})

  // Handle Payment Verification on Return
  const hasVerifiedRef = useRef(false)
  const referenceParam = useMemo(() => {
    return searchParams.get('reference') || searchParams.get('trxref')
  }, [searchParams])
  useEffect(() => {
    if (!referenceParam || hasVerifiedRef.current) return
    hasVerifiedRef.current = true
    router.replace('/dashboard/fees')
    dispatch(verifyPayment(referenceParam))
      .unwrap()
      .then(() => {
        dispatch(fetchMyPayments())
      })
      .catch(() => {
        // Error is handled in state
      })
  }, [referenceParam, dispatch, router])

  // Clear verification status after 5 seconds
  useEffect(() => {
    if (verificationStatus === 'success' || verificationStatus === 'failed') {
      const timer = setTimeout(() => {
        dispatch(resetVerificationStatus())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [verificationStatus, dispatch])

  // Profile/application data is fetched from DashboardLayout; avoid duplicate requests here.

  useEffect(() => {
    const allApps = [application, ...(applications || [])].filter(Boolean)
    // Fetch fees for all applications regardless of status
    const apps = allApps
    
    if (apps.length === 0) {
      setApplicableFees([])
      dispatch(fetchMyPayments())
      return
    }
    let mounted = true
    const loadApplicable = async () => {
      try {
        const results = await Promise.all(apps.map(async (app) => {
          const programId = app!.programmeId
          const prog = programs.find(p => p.id === programId)
          const departmentId = prog?.departmentId
          const facId = app!.facultyId || (faculties.find(f => f.departments?.some(d => d.id === departmentId))?.id)
          const sessionId = app!.sessionId
          const programLevelId = prog?.programLevelId
          
          const params = new URLSearchParams()
          if (programId) params.set('programId', String(programId))
          if (departmentId) params.set('departmentId', String(departmentId))
          if (facId) params.set('facultyId', String(facId))
          if (sessionId) params.set('sessionId', String(sessionId))
          if (programLevelId) params.set('programLevelId', String(programLevelId))
          const res = await api.get(`/fees/applicable?${params.toString()}`).catch(() => ({ data: { data: [] } }))
          const responseData = (res as { data: { data: Fee[] } }).data;
          const data = Array.isArray(responseData?.data) ? responseData.data : []
          return data as Fee[]
        }))
        if (!mounted) return
        const map = new Map<string, Fee>()
        results.flat().forEach(f => {
          if (!map.has(f.id)) map.set(f.id, f)
        })
        setApplicableFees(Array.from(map.values()))
      } finally {
        dispatch(fetchMyPayments())
      }
    }
    loadApplicable()
    return () => { mounted = false }
  }, [application, applications, programs, faculties, dispatch])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmData, setConfirmData] = useState<{ fee?: Fee; percent?: number; amount?: number; reference?: string; paymentUrl?: string }>({})

  // Handle Payment Initiation
  const handlePay = (fee: Fee) => {
    setSelectedFee(fee)
    const percent = percentByFee[fee.id] || 100
    const targetProgramId = fee.programId || application?.programmeId;

    const rawPhone = profile?.phone || (user as { phone?: string } | null)?.phone || ''
    const numericPhone = rawPhone.replace(/\D/g, '')
    const normalizedPhone = numericPhone.startsWith('234') && numericPhone.length === 13
      ? numericPhone.slice(3)
      : numericPhone
    const studentName = `${profile?.firstName || user?.firstName || ''} ${profile?.lastName || user?.lastName || ''}`.trim()
    const studentEmail = profile?.email || user?.email

    const payAmount = Math.round(Number(fee.amount) * (percent / 100) * 100) / 100
    dispatch(initiatePayment({
      feeId: fee.id,
      amount: payAmount,
      percentagePaid: percent,
      percent,
      redirectUrl: `${window.location.origin}/dashboard/fees`,
      programId: targetProgramId,
      sessionId: application?.sessionId,
      studentEmail,
      studentName,
      phoneNumber: normalizedPhone || undefined,
      address: profile?.address || undefined,
      userId: user?.id || profile?.userId || undefined,
      applicantId: application?.applicantId,
      applicationId: application?.id,
      channel: 'globalpay'
    })).unwrap().then((res) => {
      const payload = res as { authorization_url?: string; link?: string; checkoutUrl?: string; reference?: string };
      const link = payload.authorization_url || payload.link || payload.checkoutUrl || null
      const ref = payload.reference || null
      setConfirmData({ fee, percent, amount: payAmount, reference: ref || undefined, paymentUrl: link || undefined })
      setConfirmOpen(true)
      if (link) {
        dispatch(clearPaymentUrl())
      }
    }).catch(() => {})
  }

  // Helper to format currency
  const formatCurrency = (amount: number | string, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(Number(amount))
  }

  // Helper: total paid percentage for a fee (fallback to amount/fee.amount if percentage missing)
  const getPaidPercentageForFee = (fee: Fee) => {
    const successStatuses = ['SUCCESSFUL', 'SUCCESS', 'COMPLETED', 'PAID']
    const success = payments.filter(p => {
      const isSuccess = successStatuses.includes(String(p.status).toUpperCase())
      if (!isSuccess) return false
      return p.feeId === fee.id || (Array.isArray(p.items) && p.items.some(it => it.feeId === fee.id))
    })

    const totalPaidAmount = success.reduce((acc, p) => {
      // If it's the primary fee and no items, use p.amount
      if (p.feeId === fee.id && (!Array.isArray(p.items) || p.items.length === 0)) {
        return acc + (p.amount || 0)
      }
      // Otherwise find the item in the list
      const item = Array.isArray(p.items) ? p.items.find(it => it.feeId === fee.id) : null
      return acc + (item ? item.amount || 0 : 0)
    }, 0)

    return Math.min(100, Math.round((totalPaidAmount / Number(fee.amount || 1)) * 100))
  }

  const getReceiptUrlForFee = (feeId: string) => {
    const successStatuses = ['SUCCESSFUL', 'SUCCESS', 'COMPLETED', 'PAID']
    const payment = payments.find(p => {
      const isSuccess = successStatuses.includes(String(p.status).toUpperCase())
      if (!isSuccess) return false
      const isMatch = p.feeId === feeId || (Array.isArray(p.items) && p.items.some(it => it.feeId === feeId))
      return isMatch && p.proofUrl
    })
    return payment ? buildPaymentUrl(`/receipts/${payment.id}/serve`) : null
  }

  const downloadReceipt = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  }

  // Helper to check if a fee is pending verification
  const isFeePending = (feeId: string) => {
    const related = payments.filter(p => p.feeId === feeId)
    const hasSuccess = related.some(p => p.status === 'SUCCESSFUL')
    if (hasSuccess) return false
    return related.some(p => p.status === 'PENDING')
  }
  const getLatestPendingForFee = (feeId: string) => {
    const list = payments.filter(p => p.feeId === feeId && p.status === 'PENDING')
    if (list.length === 0) return null
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }
  const handleContinuePending = (fee: Fee) => {
    const pending = getLatestPendingForFee(fee.id)
    if (!pending) return
    const pct = Math.max(1, Math.round(((pending.amount || 0) / Number(fee.amount || 1)) * 100))
    setPercentByFee(prev => ({ ...prev, [fee.id]: pct }))
    handlePay(fee)
  }

  const displayFees = useMemo(() => applicableFees, [applicableFees])

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Fees & Payments
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your tuition, acceptance fees, and view transaction history.
          </p>
        </div>
        
        {/* Tabs Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('fees')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === 'fees' 
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <Banknote className="w-4 h-4" />
            Available Fees
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === 'history' 
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <History className="w-4 h-4" />
            Payment History
          </button>
        </div>
      </div>

      {/* Verification Status Banners */}
      {verificationStatus === 'verifying' && (
        <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 p-4 rounded-xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm font-medium">Verifying payment, please wait...</p>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Payment successful! Your transaction has been recorded.</p>
        </div>
      )}
      
      {verificationStatus === 'pending' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Payment not confirmed yet.</p>
            <p className="text-xs mt-1">Reconciliation may update automatically later if the gateway posts a notification.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              // Retry with latest pending payment reference
              const latestPending = [...payments]
                .filter(p => p.status === 'PENDING')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (latestPending?.reference) {
                dispatch(verifyPayment(latestPending.reference))
                  .unwrap()
                  .then(() => dispatch(fetchMyPayments()))
                  .catch(() => {});
              }
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {verificationStatus === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <XCircle className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{error || "Payment verification failed. Please contact support if this persists."}</p>
            <p className="text-xs mt-1">Note: Reconciliation may still update this later if the gateway posts an eventual notification.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const latestPending = [...payments]
                .filter(p => p.status === 'PENDING')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              if (latestPending?.reference) {
                dispatch(verifyPayment(latestPending.reference))
                  .unwrap()
                  .then(() => dispatch(fetchMyPayments()))
                  .catch(() => {});
              }
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {error && verificationStatus !== 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => dispatch(clearError())} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {loading && fees.length === 0 && payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
          <p className="text-zinc-400 text-sm mt-4 font-medium">Loading financial records...</p>
        </div>
      ) : (
        <>
          {/* FEES TAB */}
          {activeTab === 'fees' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayFees.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <Banknote className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">No fees available for your current application selection.</p>
                </div>
              ) : (
                displayFees.map((fee) => {
                  const paidPct = getPaidPercentageForFee(fee)
                  const isPaid = paidPct >= 100
                  const isPending = isFeePending(fee.id)
                  
                  return (
                    <Card key={fee.id} className={cn(
                      "relative overflow-hidden transition-all hover:shadow-md",
                      isPaid ? "border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10" : ""
                    )}>
                      {isPaid && (
                        <div className="absolute top-0 right-0 p-3">
                          <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                          <Banknote className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <CardTitle className="text-lg font-bold">{fee.name}</CardTitle>
                        <CardDescription>{fee.description || "No description provided"}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                          {paidPct > 0 && paidPct < 100 ? 'Balance Due' : 'Total Fee'}
                        </div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white">
                          {paidPct > 0 && paidPct < 100
                            ? formatCurrency(Number(fee.amount) * ((100 - paidPct) / 100), fee.currency)
                            : formatCurrency(fee.amount, fee.currency)}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {fee.mandatory && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">
                              Mandatory
                            </span>
                          )}
                          {fee.semester && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">
                              {fee.semester} Semester
                            </span>
                          )}
                          {!isPaid && paidPct === 0 && ['50','75','100'].map(p => {
                            const val = Number(p)
                            const active = (percentByFee[fee.id] || 100) === val
                            const disabled = val <= paidPct
                            return (
                              <button
                                key={p}
                                onClick={() => {
                                  if (!disabled) setPercentByFee(prev => ({ ...prev, [fee.id]: val }))
                                }}
                                className={cn(
                                  "text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border",
                                  disabled ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-60" :
                                  active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                                )}
                                aria-disabled={disabled}
                                disabled={disabled}
                              >
                                {p}%
                              </button>
                            )
                          })}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        {isPaid ? (
                          getReceiptUrlForFee(fee.id) ? (
                            <Button
                              variant="outline"
                              className="w-full border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              onClick={() => {
                                const url = getReceiptUrlForFee(fee.id)
                                if (url) downloadReceipt(url, `NBU-Receipt-${fee.name.replace(/\s+/g, '_')}.pdf`)
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Download Receipt
                            </Button>
                          ) : (
                            <Button disabled variant="outline" className="w-full border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-50 cursor-default">
                              Payment Complete
                            </Button>
                          )
                        ) : isPending ? (
                          <div className="flex flex-col gap-2 w-full">
                            <Button variant="outline" className="w-full border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                              onClick={() => handleContinuePending(fee)}
                            >
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Continue Payment
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full text-xs text-zinc-500"
                              onClick={() => dispatch(verifyPayment(getLatestPendingForFee(fee.id)?.reference || '')).unwrap().then(() => dispatch(fetchMyPayments())).catch(() => {})}
                            >
                              Retry Verification
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            {paidPct > 0 && paidPct < 100 ? (
                              <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                  const remaining = Math.max(0, 100 - paidPct)
                                  setPercentByFee(prev => ({ ...prev, [fee.id]: remaining }))
                                  handlePay(fee)
                                }}
                                disabled={actionLoading && selectedFee?.id === fee.id}
                              >
                                {actionLoading && selectedFee?.id === fee.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Initializing...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Balance {Math.max(0, 100 - paidPct)}% ({formatCurrency(Number(fee.amount) * (Math.max(0, 100 - paidPct) / 100), fee.currency)})
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handlePay(fee)}
                                disabled={actionLoading && selectedFee?.id === fee.id}
                              >
                                {actionLoading && selectedFee?.id === fee.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Initializing...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay {(percentByFee[fee.id] || 100)}%
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
               {payments.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500 font-medium">No payment history found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Reference</th>
                        <th className="px-6 py-4 font-bold">Fee / Item</th>
                        <th className="px-6 py-4 font-bold">Amount</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-500">{payment.reference}</td>
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                            {payment.fee?.name || (payment.items && payment.items.length > 0 ? 'Multiple Items' : 'Unknown Fee')}
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-zinc-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                              payment.status === 'SUCCESSFUL' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                              payment.status === 'PENDING' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {payment.status === 'SUCCESSFUL' && payment.proofUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  downloadReceipt(
                                    buildPaymentUrl(`/receipts/${payment.id}/serve`),
                                    `NBU-Receipt-${payment.reference}.pdf`
                                  )
                                }}
                              >
                                <FileText className="w-3 h-3 mr-2" />
                                Receipt
                              </Button>
                            )}
                            {payment.status === 'PENDING' && (
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                Retry
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <ConfirmPaymentModal
        open={confirmOpen}
        fee={confirmData.fee}
        percent={confirmData.percent}
        amount={confirmData.amount}
        reference={confirmData.reference}
        paymentUrl={confirmData.paymentUrl}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={(url) => {
          if (url) {
            window.location.href = url
            setConfirmOpen(false)
          }
        }}
      />
    </div>
  </div>
)
}

export default function FeesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
        <p className="text-zinc-400 text-sm mt-4 font-medium">Initializing payment portal...</p>
      </div>
    }>
      <FeesContent />
    </Suspense>
  )
}

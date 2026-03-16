'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, School } from "lucide-react"

interface VerificationResult {
  valid: boolean
  status: string
  applicant: {
    name: string
    applicationNumber: string
    program: string
    faculty: string
    session: string
    admittedDate: string
  }
}

export default function VerifyAdmissionPage() {
  const params = useParams<{ id: string | string[] }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/admission/verify/${id}`)
        setResult(response.data)
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } }
        setResult({
          valid: false,
          status: 'INVALID',
          applicant: {
            name: '',
            applicationNumber: '',
            program: '',
            faculty: '',
            session: '',
            admittedDate: ''
          }
        })
        if (error.response?.status === 404) {
            setError('Application record not found.')
        } else {
            setError('Verification failed. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="text-sm text-gray-500">Verifying admission status...</span>
        </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
             <School className="h-8 w-8 text-blue-600" />
           </div>
           <CardTitle className="text-2xl font-bold text-gray-900">Admission Verification</CardTitle>
           <p className="text-sm text-gray-500">Nigerian British University</p>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {result?.valid ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <span className="text-lg font-bold text-green-700">Valid Admission Offer</span>
                <span className="text-xs text-green-600">This offer is authentic and active.</span>
              </div>
              
              <div className="text-left space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold mb-1">Applicant Name</span>
                  <span className="font-bold text-gray-900 text-xl block truncate">{result.applicant.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                    <div>
                        <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold mb-1">Application No</span>
                        <span className="font-medium text-gray-800">{result.applicant.applicationNumber}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold mb-1">Session</span>
                        <span className="font-medium text-gray-800">{result.applicant.session}</span>
                    </div>
                </div>
                
                <div className="pb-3 border-b border-gray-100">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold mb-1">Admitted Program</span>
                  <span className="font-medium text-gray-800 block">{result.applicant.program}</span>
                </div>
                
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider font-semibold mb-1">Faculty</span>
                  <span className="font-medium text-gray-800 block">{result.applicant.faculty}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Verified at {new Date().toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center space-y-2">
                <XCircle className="h-12 w-12 text-red-600" />
                <span className="text-lg font-bold text-red-700">Invalid Offer</span>
                <p className="text-red-600 text-sm">
                    {error || 'The admission record could not be verified. It may be invalid, withdrawn, or does not exist.'}
                </p>
              </div>
              <p className="text-xs text-gray-400">If you believe this is an error, please contact the Admissions Unit.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

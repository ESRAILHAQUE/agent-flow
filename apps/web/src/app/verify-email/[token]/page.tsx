'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useVerifyEmailQuery } from '@/store/services/authApi';
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  const params = useParams();
  const token = (params?.token as string) || '';

  const { data, error, isLoading } = useVerifyEmailQuery(token, {
    skip: !token,
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo and header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Verifying your AgentFlow account credentials
          </p>
        </div>

        {/* Status card */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6 text-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-zinc-400">Validating token with server...</p>
            </div>
          )}

          {!isLoading && data?.success && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                <h3 className="text-xl font-bold text-zinc-100">Verification Complete</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                  {data.message || 'Your email address has been successfully verified.'}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl focus:outline-none transition-all duration-200 shadow-lg"
              >
                Sign In to Workspace
              </Link>
            </div>
          )}

          {!isLoading && (error || !data?.success) && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center space-y-2">
                <XCircle className="h-14 w-14 text-red-500" />
                <h3 className="text-xl font-bold text-zinc-100">Verification Failed</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                  {(error as any)?.data?.error || 'The verification link is invalid, expired, or has already been used.'}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/register"
                  className="inline-flex w-full justify-center py-3 px-4 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-zinc-100 font-medium rounded-xl transition-all duration-200"
                >
                  Create New Account
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Go to Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

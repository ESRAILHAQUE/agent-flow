'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { forgotPasswordSchema, type ForgotPasswordInput } from '@agentflow/shared';
import { useForgotPasswordMutation } from '@/store/services/authApi';
import { toast } from 'react-hot-toast';
import { Loader2, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { zodResolver as resolverShim } from '@hookform/resolvers/zod';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: resolverShim(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const result = await forgotPassword(data).unwrap();
      if (result.success) {
        toast.success(result.message || 'Password reset email sent!');
      } else {
        toast.error(result.error || 'Request failed');
      }
    } catch (error: any) {
      toast.error(error?.data?.error || 'Something went wrong. Please try again.');
    }
  };

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
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            No worries! Enter your email and we'll send you reset instructions
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-sm font-medium text-emerald-400">
                  Password reset email has been sent. Check your inbox!
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Link back to login */}
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

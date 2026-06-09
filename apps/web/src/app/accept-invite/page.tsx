'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAcceptInviteMutation } from '@/store/services/orgApi';
import { toast } from 'react-hot-toast';
import { Loader2, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

type AcceptInviteForm = {
  name: string;
  password?: string;
};

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [acceptInvite, { isLoading, isSuccess }] = useAcceptInviteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteForm>();

  const onSubmit = async (formData: AcceptInviteForm) => {
    if (!token) {
      toast.error('Invitation token is missing');
      return;
    }
    try {
      const result = await acceptInvite({
        token,
        name: formData.name,
        password: formData.password || undefined,
      }).unwrap();

      if (result.success) {
        toast.success(result.message || 'Successfully joined workspace!');
        setTimeout(() => router.push('/login'), 2500);
      } else {
        toast.error(result.error || 'Failed to accept invitation');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to accept invitation. Link may be expired.');
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
      {isSuccess ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-sm font-medium text-emerald-400">
              Workspace invitation accepted successfully! Redirecting you to login...
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            <span>Go to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('name', { required: 'Name is required' })}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Optional Password input (if new user profile) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Password (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Workspace'
            )}
          </button>

          {!token && (
            <p className="text-center text-xs text-red-400 font-medium">
              ⚠️ Warning: Invalid or missing invitation token in URL
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
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
            Accept Invitation
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Set up your details to collaborate with your team workspace
          </p>
        </div>

        {/* Suspense wrapper for SearchParams */}
        <Suspense
          fallback={
            <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-2xl flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          }
        >
          <AcceptInviteInner />
        </Suspense>
      </div>
    </div>
  );
}

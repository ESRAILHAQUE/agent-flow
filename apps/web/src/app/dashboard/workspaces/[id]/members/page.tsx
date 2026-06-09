'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  useGetWorkspaceMembersQuery,
  useInviteMemberMutation,
} from '@/store/services/orgApi';
import { toast } from 'react-hot-toast';
import { Loader2, Users, ArrowLeft, MailPlus, UserCheck, ShieldAlert } from 'lucide-react';

type InviteForm = {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = (params?.id as string) || '';

  const { data, isLoading: isFetching, refetch } = useGetWorkspaceMembersQuery(teamId, {
    skip: !teamId,
  });
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const onSubmit = async (formData: InviteForm) => {
    try {
      const result = await inviteMember({
        teamId,
        email: formData.email,
        role: formData.role,
      }).unwrap();

      if (result.success) {
        toast.success(result.message || 'Invitation sent successfully!');
        reset();
        refetch();
      } else {
        toast.error(result.error || 'Failed to send invite');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to send invitation');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading workspace members...</p>
      </div>
    );
  }

  const members = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Back to Workspaces */}
      <button
        onClick={() => router.push('/dashboard/workspaces')}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workspaces
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500" />
          Workspace Members
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Invite teammates to collaborate on AI agents, workflows, and conversations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-zinc-200">Workspace Members</h2>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl divide-y divide-zinc-900 overflow-hidden">
            {members.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No members found in this workspace.
              </div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 uppercase text-sm">
                      {m.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-zinc-250 text-sm">{m.user?.name}</span>
                        {!m.inviteAccepted && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-yellow-500/10 border border-yellow-500/20 text-yellow-450 rounded-full uppercase">
                            Pending Invite
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{m.user?.email || m.invitedEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-zinc-950 border border-zinc-850 text-zinc-400 rounded-full">
                      {m.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invite Form Card */}
        <div>
          <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-3xl space-y-5">
            <h3 className="text-lg font-bold text-zinc-250 flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-blue-500" />
              Invite Colleague
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Workspace Role
                </label>
                <select
                  {...register('role', { required: true })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="MEMBER">Member (Can edit resources)</option>
                  <option value="ADMIN">Admin (Full write & invite privileges)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isInviting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send Invitation'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

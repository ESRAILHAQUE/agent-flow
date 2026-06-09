'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetOrganizationQuery, useUpdateOrganizationMutation } from '@/store/services/orgApi';
import { toast } from 'react-hot-toast';
import { Loader2, Settings, ShieldAlert, Award } from 'lucide-react';

const orgSettingsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
});

type OrgSettingsForm = {
  name: string;
  slug: string;
};

export default function OrgSettingsPage() {
  const { data, isLoading: isFetching, refetch } = useGetOrganizationQuery();
  const [updateOrg, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrgSettingsForm>({
    resolver: zodResolver(orgSettingsSchema),
  });

  useEffect(() => {
    if (data?.data) {
      setValue('name', data.data.name);
      setValue('slug', data.data.slug);
    }
  }, [data, setValue]);

  const onSubmit = async (formData: OrgSettingsForm) => {
    try {
      const result = await updateOrg({
        name: formData.name,
        slug: formData.slug,
      }).unwrap();

      if (result.success) {
        toast.success('Organization settings updated successfully');
        refetch();
      } else {
        toast.error(result.error || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update organization settings');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Fetching settings details...</p>
      </div>
    );
  }

  const org = data?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" />
          Organization Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Manage your enterprise tenant name, slug identifier, and subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Card */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-900 p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold text-zinc-200">General Settings</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Org Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Organization Name
              </label>
              <input
                type="text"
                placeholder="Acme Corp"
                {...register('name', { required: 'Organization name is required' })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Org Slug */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Organization Slug URL
              </label>
              <div className="flex rounded-xl overflow-hidden border border-zinc-850 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="bg-zinc-900 px-4 py-3 text-sm text-zinc-500 border-r border-zinc-850 select-none">
                  agentflow.com/
                </span>
                <input
                  type="text"
                  placeholder="acme-corp"
                  {...register('slug', { required: 'Slug is required' })}
                  className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 placeholder-zinc-650 focus:outline-none transition-all duration-200"
                />
              </div>
              {errors.slug && (
                <p className="mt-1.5 text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/10"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Subscription Sidebar info */}
        <div className="space-y-6">
          {/* Plan Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Plan</span>
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full">
                {org?.plan || 'FREE'}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-zinc-100 flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                {org?.plan === 'FREE' ? 'Free Starter' : org?.plan === 'PRO' ? 'Pro Workspace' : 'Enterprise Scale'}
              </h3>
              <p className="text-xs text-zinc-400">
                {org?.plan === 'FREE' 
                  ? 'Limited to 1 workspace, 100 messages/mo' 
                  : 'Unlimited workspaces, advanced RAG tools, priority support'}
              </p>
            </div>

            <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Billing Cycle</span>
              <span className="text-xs text-zinc-300 font-medium">
                {org?.subscription?.currentPeriodEnd 
                  ? new Date(org.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-bold text-sm">Danger Zone</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Deleting this organization removes all workspaces, models, documents, and historical team message metrics forever.
            </p>
            <button
              onClick={() => toast.error('Organization deletion requires supervisor confirmation')}
              className="w-full py-2.5 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-medium rounded-xl transition-all duration-200 text-xs"
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

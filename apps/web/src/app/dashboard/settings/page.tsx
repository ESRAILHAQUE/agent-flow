'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useGetApiKeysQuery,
  useSaveApiKeysMutation,
  useDeleteApiKeysMutation,
  useTestApiKeyMutation,
} from '@/store/services/orgApi';
import { toast } from 'react-hot-toast';
import {
  Loader2, Settings, ShieldAlert, Award, Key, Eye, EyeOff,
  CheckCircle2, XCircle, Trash2, TestTube2, ExternalLink,
} from 'lucide-react';

const orgSettingsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
});

type OrgSettingsForm = { name: string; slug: string };

// ----------------------------------------------------------------
// API Key Input Row
// ----------------------------------------------------------------
function ApiKeyInput({
  label, placeholder, value, onChange, hasSaved, maskedValue,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hasSaved: boolean;
  maskedValue: string | null;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </label>

      {hasSaved && !value && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-300 font-mono tracking-wider">{maskedValue}</span>
          <span className="text-xs text-zinc-500 ml-auto">Saved & Encrypted</span>
        </div>
      )}

      <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type={show ? 'text' : 'password'}
          placeholder={hasSaved ? 'Enter new key to replace...' : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none text-sm font-mono"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 bg-zinc-900 border-l border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main Settings Page
// ----------------------------------------------------------------
export default function OrgSettingsPage() {
  const { data, isLoading: isFetching, refetch } = useGetOrganizationQuery();
  const [updateOrg, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  const { data: apiKeyData, isLoading: isLoadingKeys, refetch: refetchKeys } = useGetApiKeysQuery();
  const [saveApiKeys, { isLoading: isSavingKeys }] = useSaveApiKeysMutation();
  const [deleteApiKeys, { isLoading: isDeletingKeys }] = useDeleteApiKeysMutation();
  const [testApiKey, { isLoading: isTesting }] = useTestApiKeyMutation();

  const [openrouterKey, setOpenrouterKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrgSettingsForm>({ resolver: zodResolver(orgSettingsSchema) });

  useEffect(() => {
    if (data?.data) {
      setValue('name', data.data.name);
      setValue('slug', data.data.slug);
    }
  }, [data, setValue]);

  const onSubmit = async (formData: OrgSettingsForm) => {
    try {
      await updateOrg({ name: formData.name, slug: formData.slug }).unwrap();
      toast.success('Organization settings updated!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to update settings');
    }
  };

  const handleSaveKeys = async () => {
    if (!openrouterKey && !openaiKey) {
      toast.error('Please enter at least one API key');
      return;
    }
    try {
      await saveApiKeys({
        ...(openrouterKey ? { openrouterKey } : {}),
        ...(openaiKey ? { openaiKey } : {}),
      }).unwrap();
      toast.success('API keys saved and encrypted!');
      setOpenrouterKey('');
      setOpenaiKey('');
      refetchKeys();
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to save API keys');
    }
  };

  const handleDeleteKeys = async () => {
    try {
      await deleteApiKeys().unwrap();
      toast.success('API keys removed');
      refetchKeys();
    } catch {
      toast.error('Failed to remove API keys');
    }
  };

  const handleTest = async (provider: 'openrouter' | 'openai') => {
    try {
      const res = await testApiKey({ provider }).unwrap();
      toast.success(res.message || 'API key is valid!');
    } catch (err: any) {
      toast.error(err?.data?.error || `${provider} key test failed`);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Fetching settings...</p>
      </div>
    );
  }

  const org = data?.data;
  const keys = apiKeyData?.data;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" />
          Organization Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Manage your workspace name, API keys, and subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* General Settings */}
          <div className="bg-zinc-900/40 border border-zinc-900 p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-zinc-200">General Settings</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  {...register('name')}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Organization Slug
                </label>
                <div className="flex rounded-xl overflow-hidden border border-zinc-800 focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-zinc-900 px-4 py-3 text-sm text-zinc-500 border-r border-zinc-800 select-none">agentflow.io/</span>
                  <input
                    type="text"
                    placeholder="acme-corp"
                    {...register('slug')}
                    className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
                  />
                </div>
                {errors.slug && <p className="mt-1.5 text-xs text-red-500">{errors.slug.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* ---- BYOK: API Keys Section ---- */}
          <div className="bg-zinc-900/40 border border-zinc-900 p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-violet-400" />
                <h2 className="text-xl font-bold text-zinc-200">API Keys</h2>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Get OpenRouter Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-4 bg-violet-500/5 border border-violet-500/15 rounded-2xl text-sm text-zinc-400">
              🔑 <strong className="text-zinc-300">Bring Your Own Key (BYOK)</strong> — Your API key is
              encrypted with AES-256 and stored securely. AI costs are charged to your own account.
            </div>

            {isLoadingKeys ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading key status...
              </div>
            ) : (
              <div className="space-y-5">
                <ApiKeyInput
                  label="OpenRouter API Key (Recommended)"
                  placeholder="sk-or-v1-..."
                  value={openrouterKey}
                  onChange={setOpenrouterKey}
                  hasSaved={!!keys?.hasOpenrouterKey}
                  maskedValue={keys?.openrouterKeyMasked ?? null}
                />

                <ApiKeyInput
                  label="OpenAI API Key (Optional)"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={setOpenaiKey}
                  hasSaved={!!keys?.hasOpenaiKey}
                  maskedValue={keys?.openaiKeyMasked ?? null}
                />

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveKeys}
                    disabled={isSavingKeys || (!openrouterKey && !openaiKey)}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 text-sm"
                  >
                    {isSavingKeys ? <><Loader2 className="h-4 w-4 animate-spin" />Encrypting...</> : <><Key className="h-4 w-4" />Save Keys</>}
                  </button>

                  {keys?.hasOpenrouterKey && (
                    <button
                      onClick={() => handleTest('openrouter')}
                      disabled={isTesting}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                      {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                      Test OpenRouter
                    </button>
                  )}

                  {keys?.hasOpenaiKey && (
                    <button
                      onClick={() => handleTest('openai')}
                      disabled={isTesting}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                      {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                      Test OpenAI
                    </button>
                  )}

                  {(keys?.hasOpenrouterKey || keys?.hasOpenaiKey) && (
                    <button
                      onClick={handleDeleteKeys}
                      disabled={isDeletingKeys}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all flex items-center gap-2 text-sm border border-red-500/20"
                    >
                      {isDeletingKeys ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Remove All
                    </button>
                  )}
                </div>

                {/* Status indicators */}
                <div className="flex gap-4 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    {keys?.hasOpenrouterKey
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      : <XCircle className="h-3.5 w-3.5 text-zinc-600" />}
                    <span className={keys?.hasOpenrouterKey ? 'text-emerald-400' : 'text-zinc-600'}>OpenRouter</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {keys?.hasOpenaiKey
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      : <XCircle className="h-3.5 w-3.5 text-zinc-600" />}
                    <span className={keys?.hasOpenaiKey ? 'text-emerald-400' : 'text-zinc-600'}>OpenAI</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4">
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
                  ? 'Up to 2 agents, 1 workspace, 5 documents'
                  : org?.plan === 'PRO'
                  ? '10 agents, 5 workspaces, 100 documents, advanced analytics'
                  : 'Unlimited everything, custom branding, dedicated support'}
              </p>
            </div>
            <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Next Billing</span>
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
              Deleting this organization removes all agents, documents, conversations, and billing data permanently.
            </p>
            <button
              onClick={() => toast.error('Organization deletion requires supervisor confirmation')}
              className="w-full py-2.5 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-medium rounded-xl transition-all text-xs"
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

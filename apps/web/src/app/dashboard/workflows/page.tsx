'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  useGetWorkflowsQuery,
  useCreateWorkflowMutation,
  useDeleteWorkflowMutation
} from '@/store/services/workflowApi';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, ArrowRight, Trash2, GitMerge } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CreateWorkflowForm = {
  name: string;
  description?: string;
};

export default function WorkflowsPage() {
  const router = useRouter();
  const { data, isLoading: isFetching, refetch } = useGetWorkflowsQuery();
  const [createWorkflow, { isLoading: isCreating }] = useCreateWorkflowMutation();
  const [deleteWorkflow, { isLoading: isDeleting }] = useDeleteWorkflowMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkflowForm>();

  const onSubmit = async (formData: CreateWorkflowForm) => {
    try {
      const result = await createWorkflow(formData).unwrap();
      if (result.success) {
        toast.success('Workflow created successfully');
        reset();
        router.push(`/dashboard/workflows/${result.data.id}/builder`);
      } else {
        toast.error('Failed to create workflow');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to create workflow');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete workflow "${name}"?`)) return;

    try {
      const result = await deleteWorkflow(id).unwrap();
      if (result.success) {
        toast.success('Workflow deleted successfully');
      } else {
        toast.error('Failed to delete workflow');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to delete workflow');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading workflows...</p>
      </div>
    );
  }

  const workflows = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
            <GitMerge className="h-8 w-8 text-blue-500" />
            Visual Workflows
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Build powerful agent chains and multi-step AI automations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflows List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-zinc-200">Your Workflows</h2>
          
          {workflows.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2">
              <GitMerge className="h-10 w-10 text-zinc-650 mx-auto" />
              <p className="text-zinc-400 font-medium">No workflows configured</p>
              <p className="text-xs text-zinc-500">Create a new workflow on the right to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-zinc-200">{wf.name}</h3>
                    {wf.description && (
                      <p className="text-sm text-zinc-400">{wf.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md text-zinc-300">
                        {wf._count?.nodes || 0} Nodes
                      </span>
                      <span>Updated {new Date(wf.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/workflows/${wf.id}/builder`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl text-xs font-semibold text-blue-400 transition-all"
                    >
                      <span>Open Builder</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(wf.id, wf.name)}
                      disabled={isDeleting}
                      className="p-2 bg-red-950/10 hover:bg-red-950/20 text-red-400 border border-red-500/10 rounded-xl hover:border-red-500/20 transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Workflow Panel */}
        <div>
          <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-3xl space-y-5 sticky top-24">
            <h3 className="text-lg font-bold text-zinc-250 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              New Workflow
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Content Writer Pipeline"
                  {...register('name', { required: 'Workflow name is required' })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Optional description"
                  {...register('description')}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Workflow'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

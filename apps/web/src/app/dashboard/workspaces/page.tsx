'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  type Workspace
} from '@/store/services/orgApi';
import { toast } from 'react-hot-toast';
import { Loader2, Layers, Plus, Users, Trash2, ArrowRight } from 'lucide-react';

type CreateWorkspaceForm = {
  name: string;
};

export default function WorkspacesPage() {
  const { data, isLoading: isFetching, refetch } = useGetWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceForm>();

  const onSubmit = async (formData: CreateWorkspaceForm) => {
    try {
      const result = await createWorkspace({ name: formData.name }).unwrap();
      if (result.success) {
        toast.success('Workspace created successfully');
        reset();
        refetch();
      } else {
        toast.error(result.error || 'Failed to create workspace');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to create workspace');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete workspace "${name}"?`)) return;

    try {
      const result = await deleteWorkspace(id).unwrap();
      if (result.success) {
        toast.success('Workspace deleted successfully');
        refetch();
      } else {
        toast.error(result.error || 'Failed to delete workspace');
      }
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to delete workspace');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading workspaces...</p>
      </div>
    );
  }

  const workspaces = data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-blue-500" />
            Workspaces
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Organize different departments, agent pools, and project scopes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workspaces List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-zinc-200">Active Workspaces</h2>
          
          {workspaces.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2">
              <Layers className="h-10 w-10 text-zinc-650 mx-auto" />
              <p className="text-zinc-400 font-medium">No workspaces configured</p>
              <p className="text-xs text-zinc-500">Create a new workspace on the right to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-zinc-200">{ws.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {ws._count?.members ?? 0} members
                      </span>
                      <span>Created {new Date(ws.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/workspaces/${ws.id}/members`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-xs font-semibold text-zinc-300 transition-all"
                    >
                      <span>Members</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(ws.id, ws.name)}
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

        {/* Create Workspace Panel */}
        <div>
          <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-3xl space-y-5">
            <h3 className="text-lg font-bold text-zinc-250 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              New Workspace
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Agents"
                  {...register('name', { required: 'Workspace name is required' })}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Workspace'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

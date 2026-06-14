'use client';

import React, { useState } from 'react';
import { useGetAllOrganizationsQuery, useDeleteOrganizationMutation, useUpdateOrgPlanMutation } from '@/store/services/adminApi';
import { Building2, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PLANS = ['FREE', 'PRO', 'ENTERPRISE'];

export default function AdminOrganizationsPage() {
  const { data, isLoading } = useGetAllOrganizationsQuery({});
  const [deleteOrg, { isLoading: isDeleting }] = useDeleteOrganizationMutation();
  const [updatePlan] = useUpdateOrgPlanMutation();

  const orgs = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`DELETE "${name}"? This will remove all associated data permanently.`)) return;
    try {
      await deleteOrg(id).unwrap();
      toast.success('Organization deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handlePlanChange = async (id: string, plan: string) => {
    try {
      await updatePlan({ id, plan }).unwrap();
      toast.success('Plan updated');
    } catch {
      toast.error('Failed to update plan');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-50">Organizations</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {meta?.total ?? 0} total organizations
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <Building2 className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500">No organizations yet</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-zinc-900 rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stats</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, i) => (
                <tr key={org.id} className={`border-b border-zinc-900/60 hover:bg-zinc-900/30 transition-colors ${i === orgs.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold uppercase text-xs">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">{org.name}</p>
                        <p className="text-xs text-zinc-500">/{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-zinc-300">{org.owner?.name}</p>
                    <p className="text-xs text-zinc-500">{org.owner?.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{org._count?.agents ?? 0} agents</span>
                      <span>{org._count?.conversations ?? 0} chats</span>
                      <span>{org._count?.documents ?? 0} docs</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <select
                        value={org.plan}
                        onChange={(e) => handlePlanChange(org.id, e.target.value)}
                        className="appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="h-3 w-3 absolute right-2 top-2 pointer-events-none text-zinc-500" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(org.id, org.name)}
                      disabled={isDeleting}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

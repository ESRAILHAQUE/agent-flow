'use client';

import React from 'react';
import { useGetAbuseStatsQuery } from '@/store/services/adminApi';
import { ShieldAlert, Loader2, TrendingUp } from 'lucide-react';

export default function AdminAbuseMonitorPage() {
  const { data, isLoading } = useGetAbuseStatsQuery();

  const stats = data?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50">Resource Abuse Monitor</h1>
          <p className="text-zinc-400 text-sm mt-1">Track top API token consumers across organizations</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
        </div>
      ) : stats.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <ShieldAlert className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500">No token usage recorded yet</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-zinc-900 rounded-2xl bg-zinc-900/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Organization Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Org ID</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Tokens Consumed</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat: any, i: number) => (
                <tr key={stat.id} className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${i === stats.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-4 text-zinc-400 font-bold">
                    #{i + 1}
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-200">
                    {stat.name}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                    {stat.id}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-yellow-500 font-mono font-bold">
                      {stat.totalTokens.toLocaleString()}
                      <TrendingUp className="h-4 w-4 opacity-50" />
                    </div>
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

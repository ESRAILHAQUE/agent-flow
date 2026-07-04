'use client';

import React from 'react';
import { useGetAuditLogsQuery } from '@/store/services/adminApi';
import { Activity, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { data, isLoading } = useGetAuditLogsQuery({});

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50">System Audit Logs</h1>
          <p className="text-zinc-400 text-sm mt-1">{meta?.total ?? 0} actions recorded</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500">No logs recorded yet</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-zinc-900 rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actor ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, i: number) => (
                <tr key={log.id} className={`border-b border-zinc-900/60 hover:bg-zinc-900/30 transition-colors ${i === logs.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-4 text-xs text-zinc-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-300">
                    {log.actorId}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-200 text-xs font-bold rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-zinc-400">
                    {log.targetId || '—'}
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-500">
                    <pre className="max-w-xs truncate">{JSON.stringify(log.metadata)}</pre>
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

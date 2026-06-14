'use client';

import React from 'react';
import { useGetSystemStatsQuery } from '@/store/services/adminApi';
import { Building2, Users, Terminal, MessageSquare, FileText, Activity, Loader2, Crown } from 'lucide-react';

export default function AdminOverviewPage() {
  const { data, isLoading } = useGetSystemStatsQuery();
  const stats = data?.data;

  const statCards = [
    { label: 'Organizations', value: stats?.totalOrganizations ?? 0, icon: Building2, color: 'red' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'orange' },
    { label: 'AI Agents', value: stats?.totalAgents ?? 0, icon: Terminal, color: 'blue' },
    { label: 'Conversations', value: stats?.totalConversations ?? 0, icon: MessageSquare, color: 'indigo' },
    { label: 'Messages', value: stats?.totalMessages ?? 0, icon: Activity, color: 'violet' },
    { label: 'Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'cyan' },
  ];

  const colorMap: Record<string, string> = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50">System Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Platform-wide statistics and health.</p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const c = colorMap[card.color];
            return (
              <div key={card.label} className={`p-5 rounded-2xl border bg-zinc-900/40 flex items-center gap-4 ${c.split(' ').slice(2).join(' ')}`}>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${c.split(' ').slice(1, 3).join(' ')}`}>
                  <Icon className={`h-6 w-6 ${c.split(' ')[0]}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-zinc-100 tabular-nums">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Organizations */}
      <div>
        <h2 className="text-lg font-bold text-zinc-300 mb-4">Recently Joined Organizations</h2>
        {isLoading ? null : (
          <div className="space-y-3">
            {stats?.recentOrgs.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-400 uppercase text-sm">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{org.name}</p>
                    <p className="text-xs text-zinc-500">{org.owner?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{org._count?.agents ?? 0} agents</span>
                  <span>{org._count?.conversations ?? 0} chats</span>
                  <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-medium">{org.plan}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

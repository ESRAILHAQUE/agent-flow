'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useGetAnalyticsQuery } from '@/store/services/orgApi';
import {
  Terminal,
  GitMerge,
  Users,
  MessageSquare,
  Database,
  FileText,
  Loader2,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: analyticsData, isLoading } = useGetAnalyticsQuery();

  if (!user) return null;

  const stats = analyticsData?.data;

  const statCards = [
    {
      label: 'AI Agents',
      value: stats?.totalAgents ?? 0,
      icon: Terminal,
      color: 'blue',
      href: '/dashboard/agents',
    },
    {
      label: 'Conversations',
      value: stats?.totalConversations ?? 0,
      icon: MessageSquare,
      color: 'indigo',
      href: null,
    },
    {
      label: 'Messages Sent',
      value: stats?.totalMessages ?? 0,
      icon: Activity,
      color: 'violet',
      href: null,
    },
    {
      label: 'Documents',
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      color: 'cyan',
      href: '/dashboard/knowledge',
    },
    {
      label: 'Workflows',
      value: stats?.totalWorkflows ?? 0,
      icon: GitMerge,
      color: 'emerald',
      href: '/dashboard/workflows',
    },
    {
      label: 'Workspaces',
      value: '-',
      icon: Users,
      color: 'orange',
      href: '/dashboard/workspaces',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    blue:    { bg: 'bg-blue-500/5',    border: 'border-blue-500/15',   text: 'text-blue-400',    iconBg: 'bg-blue-500/10' },
    indigo:  { bg: 'bg-indigo-500/5',  border: 'border-indigo-500/15', text: 'text-indigo-400',  iconBg: 'bg-indigo-500/10' },
    violet:  { bg: 'bg-violet-500/5',  border: 'border-violet-500/15', text: 'text-violet-400',  iconBg: 'bg-violet-500/10' },
    cyan:    { bg: 'bg-cyan-500/5',    border: 'border-cyan-500/15',   text: 'text-cyan-400',    iconBg: 'bg-cyan-500/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15',text: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    orange:  { bg: 'bg-orange-500/5',  border: 'border-orange-500/15', text: 'text-orange-400',  iconBg: 'bg-orange-500/10' },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-900/15 to-indigo-900/10 border border-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Welcome back, {user.name?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Here's an overview of your AgentFlow workspace. Automate workflows, manage agents, and track performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-2.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-300 font-medium">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Overview
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((card) => {
              const c = colorMap[card.color];
              const Icon = card.icon;
              const inner = (
                <div className={`p-5 rounded-2xl border ${c.bg} ${c.border} flex items-center gap-4 transition-all duration-200 hover:border-opacity-40 group`}>
                  <div className={`h-12 w-12 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-6 w-6 ${c.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold text-zinc-100 tabular-nums">{card.value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{card.label}</p>
                  </div>
                  {card.href && (
                    <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto shrink-0 transition-colors" />
                  )}
                </div>
              );
              return card.href ? (
                <Link key={card.label} href={card.href}>{inner}</Link>
              ) : (
                <div key={card.label}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Conversations */}
      <div>
        <h2 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Recent Conversations
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
          </div>
        ) : (stats?.recentConversations?.length ?? 0) === 0 ? (
          <div className="p-10 text-center border border-dashed border-zinc-800 rounded-2xl">
            <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No conversations yet. Start chatting with an agent!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats?.recentConversations.map((conv) => (
              <div key={conv.id} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 truncate max-w-xs">{conv.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{conv._count.messages} messages · {new Date(conv.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-400 truncate max-w-[120px]">
                  {conv.agentType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-zinc-300 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/agents/create" className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-blue-500/30 hover:bg-zinc-900/70 transition-all group">
            <Terminal className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Create New Agent</span>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto" />
          </Link>
          <Link href="/dashboard/knowledge" className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-cyan-500/30 hover:bg-zinc-900/70 transition-all group">
            <Database className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Upload Document</span>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto" />
          </Link>
          <Link href="/dashboard/workflows" className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/70 transition-all group">
            <GitMerge className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Build Workflow</span>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}

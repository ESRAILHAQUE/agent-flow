'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Terminal, Layers, Users, Sliders } from 'lucide-react';

export default function DashboardPage() {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border border-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
            Welcome, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Your multi-agent automation workspace is active. Set up your specialized AI workflows, connect data documents, and orchestrate support teams.
          </p>
        </div>
        <div className="px-5 py-2.5 bg-zinc-900/80 border border-zinc-850 rounded-2xl flex items-center gap-3 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-zinc-300 font-medium">Workspace Active</span>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <Link href="/dashboard/agents" className="block p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-900/60 transition-all duration-200 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-200">AI Agents</h3>
            <p className="text-sm text-zinc-500 mt-1">Configure specialist agents with custom LLM configurations and tools.</p>
          </div>
        </Link>

        {/* Card 2 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 transition-all duration-200 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-200">Workflows</h3>
            <p className="text-sm text-zinc-500 mt-1">Chain multiple AI agents into sequential processing workflows.</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 transition-all duration-200 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-200">Team Workspaces</h3>
            <p className="text-sm text-zinc-500 mt-1">Manage team access levels, invite workspace members, and trace actions.</p>
          </div>
        </div>
      </div>

      {/* Diagnostic Panel */}
      <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
        <div className="flex items-center gap-2 text-zinc-300">
          <Sliders className="h-5 w-5 text-blue-500" />
          <h3 className="font-bold">Active User Session Diagnostics</h3>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 overflow-x-auto max-w-full">
          <pre className="text-xs text-blue-400 font-mono select-all break-all whitespace-pre-wrap">
            {accessToken}
          </pre>
        </div>
      </div>
    </div>
  );
}

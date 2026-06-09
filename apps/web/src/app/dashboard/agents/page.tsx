'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Plus, Settings2, MoreVertical, BrainCircuit, Activity, PowerOff } from 'lucide-react';
import { useGetAgentsQuery, useDeleteAgentMutation } from '@/store/services/agentApi';
import { toast } from 'react-hot-toast';

export default function AgentsPage() {
  const { data: agentsData, isLoading, refetch } = useGetAgentsQuery();
  const [deleteAgent] = useDeleteAgentMutation();

  const agents = agentsData?.data || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(id).unwrap();
        toast.success('Agent deleted successfully');
      } catch (err) {
        toast.error('Failed to delete agent');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50 flex items-center gap-3">
            <Terminal className="h-8 w-8 text-blue-500" />
            AI Agents
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage your autonomous AI specialists and configure their behavior.
          </p>
        </div>
        <Link
          href="/dashboard/agents/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Link>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <BrainCircuit className="h-16 w-16 text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No AI Agents yet</h3>
          <p className="text-zinc-500 mt-2 max-w-sm mb-6">
            Get started by creating your first specialized AI agent with custom instructions and tools.
          </p>
          <Link
            href="/dashboard/agents/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="group relative flex flex-col p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-900/60 transition-all duration-200">
              
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-200">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <Settings2 className="h-3 w-3" />
                      <span>{agent.modelId}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions Dropdown (Simplified for now) */}
                <button onClick={() => handleDelete(agent.id)} className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                  <PowerOff className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-3">
                {agent.description || agent.persona}
              </p>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-auto border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-xs">
                  {agent.isActive ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-500 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-zinc-600" />
                      <span className="text-zinc-500 font-medium">Inactive</span>
                    </>
                  )}
                </div>
                
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors border border-blue-500/20"
                >
                  <Terminal className="h-3 w-3" />
                  Test Agent
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

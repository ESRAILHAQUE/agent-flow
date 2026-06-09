'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { logoutState } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/services/authApi';
import { toast } from 'react-hot-toast';
import { ShieldCheck, LogOut, Terminal, Layers, Users, Sliders } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const [logoutUser, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logoutState());
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      dispatch(logoutState());
      router.push('/login');
    }
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        {/* Header */}
        <header className="z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-blue-500" />
            <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              AgentFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-200">{user.name}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="z-10 flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-zinc-400 text-sm max-w-xl">
                Your multi-agent automation platform is ready. Connect knowledge bases, orchestrate team workflows, and deploy AI support bots.
              </p>
            </div>
            <div className="px-5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-zinc-300 font-medium">Systems fully operational</span>
            </div>
          </div>

          {/* Dashboard Grid Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-200">AI Agents</h3>
                <p className="text-sm text-zinc-500 mt-1">Configure specialist agents with custom LLM configurations and tools.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-200">Workflows</h3>
                <p className="text-sm text-zinc-500 mt-1">Chain multiple AI agents into sequential processing workflows.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-200">Workspace Members</h3>
                <p className="text-sm text-zinc-500 mt-1">Manage team access levels, invite team members, and trace actions.</p>
              </div>
            </div>
          </div>

          {/* Diagnostic / Session State Container */}
          <div className="p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Sliders className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">Active JWT Token Diagnostics</h3>
            </div>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 overflow-x-auto max-w-full">
              <pre className="text-xs text-blue-400 font-mono select-all break-all whitespace-pre-wrap">
                {accessToken}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { ShieldCheck, ArrowRight, Terminal, Layers, Users, Zap, Database } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const dashboardLink = user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard';

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-7 w-7 text-blue-500" />
          <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            AgentFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          {!isLoading && isAuthenticated ? (
            <Link
              href={dashboardLink}
              className="px-4.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/10"
            >
              {user?.role === 'SUPER_ADMIN' ? 'Admin Panel' : 'Dashboard'}
            </Link>
          ) : !isLoading ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-4xl mx-auto space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Multi-Tenant AI Agent Platform</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-none">
          Automate Enterprise Workflows <br className="hidden sm:inline" /> With Specialized AI Agents
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          AgentFlow is a professional-grade multi-tenant workspace orchestrating Large Language Models, Retrieval-Augmented Generation (RAG), and chained sequential AI workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          {!isLoading && isAuthenticated ? (
            <Link
              href={dashboardLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <span>Go to {user?.role === 'SUPER_ADMIN' ? 'Admin Panel' : 'Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : !isLoading ? (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                <span>Launch Platform</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-350 hover:text-zinc-200 font-semibold rounded-xl transition-all"
              >
                Sign In to Dashboard
              </Link>
            </>
          ) : null}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 md:pt-24 text-left w-full">
          {/* Feature 1 */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-base">Specialist AI Agents</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Configure distinct model personalities, systems, and tool suites tailored to departmental requirements.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-base">Chained Workflows</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Orchestrate multi-agent networks processing tasks sequentially with feedback loops and manual gates.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl space-y-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-base">RAG Engine</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Upload and index corporate documents into vector stores for factual, context-aware chatbot support.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-900 text-xs text-zinc-600 gap-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} AgentFlow AI Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          <a href="https://github.com/Esrail2/agent-flow" className="hover:text-zinc-400 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

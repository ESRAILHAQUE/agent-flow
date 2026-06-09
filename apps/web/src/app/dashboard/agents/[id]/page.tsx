'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Terminal, Bot, User, BrainCircuit, Sparkles } from 'lucide-react';
import { useGetAgentByIdQuery } from '@/store/services/agentApi';
import { useSendMessageMutation } from '@/store/services/chatApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentPlaygroundPage() {
  const params = useParams();
  const agentId = params.id as string;

  const { data: agentData, isLoading: isAgentLoading } = useGetAgentByIdQuery(agentId);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agentData?.data;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await sendMessage({ agentId, data: { message: userMsg.content } }).unwrap();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.content,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  if (isAgentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!agent) {
    return <div className="text-zinc-400">Agent not found.</div>;
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-900/80 p-4 rounded-3xl shrink-0">
        <Link href="/dashboard/agents" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
              {agent.name}
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/20">
                Playground
              </span>
            </h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
              <Terminal className="h-3 w-3" />
              {agent.modelId}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 bg-zinc-900/40 border border-zinc-900/80 rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <Sparkles className="h-12 w-12 text-zinc-700" />
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-300">Start testing your agent</p>
                <p className="text-sm mt-1 max-w-sm">
                  Send a message to see how it responds based on the configured persona.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700/50'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex gap-4 max-w-3xl">
              <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-zinc-800 text-zinc-400 rounded-tl-sm border border-zinc-700/50 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-900">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your agent..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-5 pr-14 py-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}

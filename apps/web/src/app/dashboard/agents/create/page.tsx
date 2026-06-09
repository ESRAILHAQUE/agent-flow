'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Terminal, ArrowLeft, Save, Sparkles, BrainCircuit, Wrench } from 'lucide-react';
import { useCreateAgentMutation } from '@/store/services/agentApi';
import { toast } from 'react-hot-toast';

const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  description: z.string().optional(),
  modelId: z.string().min(1, 'Please select a model'),
  persona: z.string().min(10, 'System prompt must be detailed (at least 10 characters)'),
  tools: z.array(z.string()).default([]),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export default function CreateAgentPage() {
  const router = useRouter();
  const [createAgent, { isLoading }] = useCreateAgentMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      modelId: 'openrouter/auto',
      persona: 'You are a helpful AI assistant specialized in...',
      tools: [],
    },
  });

  const selectedTools = watch('tools');

  const toggleTool = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setValue('tools', selectedTools.filter(t => t !== toolName));
    } else {
      setValue('tools', [...selectedTools, toolName]);
    }
  };

  const onSubmit = async (data: AgentFormValues) => {
    try {
      // Map string tools to object format expected by backend for future flexibility
      const mappedTools = data.tools.map(t => ({ name: t, config: {} }));
      
      await createAgent({
        ...data,
        tools: mappedTools,
      }).unwrap();
      
      toast.success('Agent created successfully!');
      router.push('/dashboard/agents');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to create agent');
    }
  };

  const availableTools = [
    { id: 'web_search', name: 'Web Search', description: 'Allow agent to search the internet for real-time information.' },
    { id: 'qdrant_kb', name: 'Knowledge Base', description: 'Access uploaded company documents via Qdrant.' },
    { id: 'send_email', name: 'Email Sender', description: 'Allow agent to send emails to customers or team members.' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agents" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-500" />
              Create AI Agent
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Configure a new autonomous worker for your organization.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Section */}
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 space-y-6">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-lg mb-4">
            <Terminal className="h-5 w-5 text-blue-500" />
            Basic Configuration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Agent Name <span className="text-red-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Customer Support Bot"
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Language Model <span className="text-red-500">*</span></label>
              <select
                {...register('modelId')}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
              >
                <option value="openrouter/auto">OpenRouter Auto (Recommended)</option>
                <option value="openai/gpt-4o">GPT-4o (OpenAI)</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B (Meta)</option>
              </select>
              {errors.modelId && <p className="text-xs text-red-400">{errors.modelId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Short Description</label>
            <input
              {...register('description')}
              placeholder="What does this agent do? (Optional)"
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Brain / Persona Section */}
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 space-y-6">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-lg mb-4">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
            System Prompt / Persona
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex justify-between">
              <span>Instructions <span className="text-red-500">*</span></span>
              <span className="text-xs text-zinc-500">This defines how the agent behaves</span>
            </label>
            <textarea
              {...register('persona')}
              rows={6}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-y font-mono"
            />
            {errors.persona && <p className="text-xs text-red-400">{errors.persona.message}</p>}
          </div>
        </div>

        {/* Tools Section */}
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 space-y-6">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-lg mb-4">
            <Wrench className="h-5 w-5 text-emerald-500" />
            Agent Capabilities (Tools)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTools.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              return (
                <div 
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-sm ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {tool.name}
                    </h4>
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                    }`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-zinc-950" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Agent
          </button>
        </div>

      </form>
    </div>
  );
}

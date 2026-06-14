'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Terminal } from 'lucide-react';

export default function AgentNode({ data }: { data: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-64 text-zinc-100 overflow-hidden">
      {/* Target handle for incoming data/trigger */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-zinc-900" />
      
      <div className="bg-zinc-800/80 px-4 py-2 border-b border-zinc-700 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-blue-400" />
        <div className="font-semibold text-sm">Agent Node</div>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="text-xs text-zinc-400">Task Name</div>
        <div className="text-sm font-medium truncate">{data.label || 'Unnamed Agent'}</div>
        
        {data.model && (
          <div className="mt-2 text-xs bg-zinc-800 rounded px-2 py-1 truncate text-zinc-300">
            {data.model}
          </div>
        )}
      </div>

      {/* Source handle for outgoing data/trigger */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-zinc-900" />
    </div>
  );
}

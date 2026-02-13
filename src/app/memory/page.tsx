'use client';

import { Brain } from 'lucide-react';

export default function MemoryPage() {
  return (
    <div className="flex-1 p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <Brain className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Memory</h1>
          <p className="text-zinc-500">Your personal knowledge base</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
        <p className="text-zinc-500">Memory system coming soon...</p>
      </div>
    </div>
  );
}

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FolderKanban, Construction } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-violet-400" />
          Projects
        </h1>
        <p className="text-zinc-400">Project tracking and management</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Construction className="h-16 w-16 text-zinc-600 mb-4" />
            <h2 className="text-xl font-semibold text-zinc-300 mb-2">Coming Soon</h2>
            <p className="text-zinc-500 max-w-md">
              Project tracking is being built. This will show all active projects with progress, 
              milestones, and team assignments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

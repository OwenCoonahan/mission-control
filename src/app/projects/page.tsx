'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, AlertTriangle, Target, ChevronDown, ChevronRight } from 'lucide-react'

interface Milestone {
  id: string
  title: string
  done: boolean
  dueDate: string
}

interface Project {
  id: string
  title: string
  emoji: string
  status: 'active' | 'not-started' | 'completed' | 'paused'
  priority: string
  description: string
  endState: string
  progress: number
  dueDate: string
  milestones: Milestone[]
  blockers: string[]
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(project.priority === 'P0')
  const days = daysUntil(project.dueDate)
  const completedMilestones = project.milestones.filter(m => m.done).length
  const totalMilestones = project.milestones.length
  const nextMilestone = project.milestones.find(m => !m.done)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />}
            <div>
              <h3 className="text-base font-medium text-white">{project.title}</h3>
              <p className="text-sm text-zinc-500">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{project.priority}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded ${
              project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
              project.status === 'completed' ? 'bg-violet-500/10 text-violet-400' :
              'bg-zinc-800 text-zinc-500'
            }`}>{project.status}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-600 mb-1">
            <span>{completedMilestones}/{totalMilestones} milestones</span>
            <span className={days < 7 ? 'text-red-400' : 'text-zinc-600'}>
              {days > 0 ? `${days}d left` : days === 0 ? 'Due today' : `${Math.abs(days)}d overdue`}
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        <div className="bg-zinc-800/40 rounded-md p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Done when</span>
          </div>
          <p className="text-sm text-zinc-300">{project.endState}</p>
        </div>

        {nextMilestone && !expanded && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Circle className="h-3 w-3 text-zinc-600" />
            <span>Next: {nextMilestone.title}</span>
          </div>
        )}

        {expanded && (
          <div className="mt-3 space-y-4">
            <div>
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Milestones</h4>
              <div className="space-y-1">
                {project.milestones.map((m) => {
                  const mDays = daysUntil(m.dueDate)
                  return (
                    <div key={m.id} className="flex items-center justify-between py-1.5 px-2 rounded">
                      <div className="flex items-center gap-2">
                        {m.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-zinc-700" />}
                        <span className={`text-sm ${m.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>{m.title}</span>
                      </div>
                      <span className={`text-xs ${m.done ? 'text-zinc-700' : mDays < 0 ? 'text-red-400' : 'text-zinc-600'}`}>{m.dueDate}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {project.blockers.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Blockers
                </h4>
                <div className="space-y-1">
                  {project.blockers.map((b, i) => (
                    <div key={i} className="text-sm text-red-300/70 px-2 py-1.5">{b}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data.projects || []))
      .catch(() => {
        fetch('/data/projects.json')
          .then(res => res.json())
          .then(data => setProjects(data.projects || []))
      })
  }, [])

  const activeProjects = projects.filter(p => p.status === 'active')
  const upcomingProjects = projects.filter(p => p.status === 'not-started')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const totalMilestones = projects.reduce((sum, p) => sum + p.milestones.length, 0)
  const doneMilestones = projects.reduce((sum, p) => sum + p.milestones.filter(m => m.done).length, 0)

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <p className="text-sm text-zinc-500 mt-1">Work backwards from the end state</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-semibold text-white">{activeProjects.length}</div>
            <div className="text-xs text-zinc-500">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-semibold text-white">{doneMilestones}/{totalMilestones}</div>
            <div className="text-xs text-zinc-500">Milestones</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-semibold text-red-400">{projects.reduce((sum, p) => sum + p.blockers.length, 0)}</div>
            <div className="text-xs text-zinc-500">Blockers</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-semibold text-white">{Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1))}%</div>
            <div className="text-xs text-zinc-500">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      {activeProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
          </h2>
          <div className="space-y-3">
            {activeProjects.sort((a, b) => a.priority.localeCompare(b.priority)).map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {upcomingProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Not Started
          </h2>
          <div className="space-y-3">
            {upcomingProjects.sort((a, b) => a.priority.localeCompare(b.priority)).map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Completed
          </h2>
          <div className="space-y-3">
            {completedProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

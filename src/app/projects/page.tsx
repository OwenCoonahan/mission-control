'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FolderKanban, CheckCircle2, Circle, AlertTriangle, Calendar, Target, ChevronDown, ChevronRight } from 'lucide-react'

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

const priorityColors: Record<string, string> = {
  'P0': 'bg-red-500/20 text-red-400 border-red-500/30',
  'P1': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'P2': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'P3': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

const statusColors: Record<string, string> = {
  'active': 'bg-emerald-500/20 text-emerald-400',
  'not-started': 'bg-zinc-500/20 text-zinc-400',
  'completed': 'bg-violet-500/20 text-violet-400',
  'paused': 'bg-yellow-500/20 text-yellow-400',
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
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
            <span className="text-xl">{project.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{project.title}</h3>
              <p className="text-sm text-zinc-500">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[project.priority] + ' border text-xs'}>{project.priority}</Badge>
            <Badge className={statusColors[project.status] + ' text-xs'}>{project.status}</Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>{completedMilestones}/{totalMilestones} milestones</span>
            <span className={days < 7 ? 'text-red-400' : days < 14 ? 'text-yellow-400' : 'text-zinc-500'}>
              {days > 0 ? `${days} days left` : days === 0 ? 'Due today' : `${Math.abs(days)} days overdue`}
            </span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* End State */}
        <div className="bg-zinc-800/50 rounded-lg p-3 mb-3 border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wide">Definition of Done</span>
          </div>
          <p className="text-sm text-zinc-300">{project.endState}</p>
        </div>

        {/* Next milestone */}
        {nextMilestone && !expanded && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Circle className="h-3.5 w-3.5 text-yellow-400" />
            <span>Next: {nextMilestone.title}</span>
            <span className="text-xs text-zinc-600">({nextMilestone.dueDate})</span>
          </div>
        )}

        {/* Expanded: milestones + blockers */}
        {expanded && (
          <div className="mt-3 space-y-4">
            {/* Milestones */}
            <div>
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Milestones</h4>
              <div className="space-y-2">
                {project.milestones.map((m) => {
                  const mDays = daysUntil(m.dueDate)
                  return (
                    <div key={m.id} className={`flex items-center justify-between py-1.5 px-2 rounded ${m.done ? 'bg-emerald-500/5' : mDays < 0 ? 'bg-red-500/5' : ''}`}>
                      <div className="flex items-center gap-2">
                        {m.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-600" />
                        )}
                        <span className={`text-sm ${m.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{m.title}</span>
                      </div>
                      <span className={`text-xs ${m.done ? 'text-zinc-600' : mDays < 0 ? 'text-red-400' : mDays < 3 ? 'text-yellow-400' : 'text-zinc-600'}`}>
                        {m.dueDate}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Blockers */}
            {project.blockers.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Blockers
                </h4>
                <div className="space-y-1">
                  {project.blockers.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-300/80 bg-red-500/5 rounded px-2 py-1.5">
                      <span>⚠️</span>
                      <span>{b}</span>
                    </div>
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
        // Fallback: load from static data
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
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-violet-400" />
          Projects
        </h1>
        <p className="text-zinc-400">Work backwards from the end state. Every project has a definition of done.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{activeProjects.length}</div>
            <div className="text-xs text-zinc-500">Active Projects</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{doneMilestones}/{totalMilestones}</div>
            <div className="text-xs text-zinc-500">Milestones Done</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{projects.reduce((sum, p) => sum + p.blockers.length, 0)}</div>
            <div className="text-xs text-zinc-500">Blockers</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / (projects.length || 1))}%</div>
            <div className="text-xs text-zinc-500">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Active
          </h2>
          <div className="space-y-4">
            {activeProjects.sort((a, b) => a.priority.localeCompare(b.priority)).map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Not Started */}
      {upcomingProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            Not Started
          </h2>
          <div className="space-y-4">
            {upcomingProjects.sort((a, b) => a.priority.localeCompare(b.priority)).map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            Completed
          </h2>
          <div className="space-y-4">
            {completedProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

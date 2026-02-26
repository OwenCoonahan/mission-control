'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  AlertTriangle,
  Handshake,
  CheckSquare,
  Clock,
} from 'lucide-react'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  goal: string
  dueDate: string | null
  completed: boolean
}

interface Goal {
  id: string
  title: string
  emoji: string
  description: string
  progress: number
  color: string
}

interface Lead {
  id: string
  name: string
  company: string
  role: string
  status: string
  source: string
  lastContact: string
  nextAction: string
  priority: string
  email?: string
}

interface Project {
  id: string
  title: string
  emoji: string
  blockers: string[]
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, goalsRes, pipelineRes, projectsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/goals'),
          fetch('/api/pipeline'),
          fetch('/api/projects'),
        ])
        const [tasksData, goalsData, pipelineData, projectsData] = await Promise.all([
          tasksRes.json(), goalsRes.json(), pipelineRes.json(), projectsRes.json(),
        ])
        setTasks(tasksData.tasks || [])
        setGoals(goalsData.goals || [])
        setLeads(pipelineData.leads || [])
        setProjects(projectsData.projects || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const frogTask = tasks.find(t => t.priority === 'frog' && !t.completed)
  const sprintTasks = tasks
    .filter(t => !t.completed && (t.status === 'today' || t.status === 'in-progress'))
    .sort((a, b) => {
      const order: Record<string, number> = { frog: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
    })
    .slice(0, 5)

  const allBlockers = projects.flatMap(p =>
    (p.blockers || []).map(b => ({ project: p.title, text: b }))
  ).filter(b => b.text.length > 0)

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">{getTimeOfDayGreeting()}, Owen</h1>
        <p className="text-sm text-zinc-500 mt-1">{formatDate(new Date())}</p>
      </div>

      {/* FROG */}
      {frogTask && (
        <Card className="mb-8 bg-zinc-900 border-zinc-800">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-violet-500 rounded-full" />
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Today&apos;s Focus</p>
                <p className="text-base font-medium text-white">{frogTask.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-zinc-200 text-sm font-medium">
              <CheckSquare className="h-4 w-4 text-zinc-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sprintTasks.map((task, i) => (
                <div key={task.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-zinc-800/40">
                  <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                  <p className="text-sm text-zinc-200 flex-1 truncate">{task.title}</p>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                    task.priority === 'frog' ? 'bg-violet-500/15 text-violet-400' :
                    task.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                    'text-zinc-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {sprintTasks.length === 0 && (
                <p className="text-sm text-zinc-600 py-4">No active tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-zinc-200 text-sm font-medium">
              <Handshake className="h-4 w-4 text-zinc-500" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 py-2 px-3 rounded-md bg-zinc-800/40">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                    lead.priority === 'hot' ? 'bg-red-500/15 text-red-400' :
                    lead.priority === 'warm' ? 'bg-orange-500/15 text-orange-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {lead.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{lead.name}{lead.company ? ` · ${lead.company}` : ''}</p>
                    <p className="text-xs text-zinc-600 truncate">{lead.nextAction}</p>
                  </div>
                  <span className="text-xs text-zinc-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {daysSince(lead.lastContact)}d
                  </span>
                </div>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-zinc-600 py-4">No leads yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blockers */}
        {allBlockers.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-zinc-200 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Blockers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allBlockers.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-md bg-zinc-800/40">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-zinc-200">{b.text}</p>
                      <p className="text-xs text-zinc-600">{b.project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goals Progress */}
      <Card className="mt-6 bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-zinc-200 text-sm font-medium">
            <Target className="h-4 w-4 text-zinc-500" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {goals.map(goal => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-200">{goal.title}</span>
                  <span className="text-xs text-zinc-500">{goal.progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

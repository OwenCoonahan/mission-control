'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  Target,
  AlertTriangle,
  Handshake,
  Zap,
  CheckSquare,
  Clock,
  Mail
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
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

const PRIORITY_COLORS: Record<string, string> = {
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-orange-500/20 text-orange-400',
  cool: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-green-500/20 text-green-400',
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
          <div className="h-8 bg-zinc-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-800 rounded-lg"></div>
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

  const quickWins = tasks.filter(t =>
    !t.completed &&
    (t.title.toLowerCase().includes('reply') ||
     t.title.toLowerCase().includes('follow up') ||
     t.title.toLowerCase().includes('clear') ||
     t.title.toLowerCase().includes('send'))
  ).slice(0, 4)

  const allBlockers = projects.flatMap(p =>
    (p.blockers || []).map(b => ({ project: p.emoji + ' ' + p.title, text: b }))
  ).filter(b => b.text.length > 0)

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{getTimeOfDayGreeting()}, Owen</h1>
        <div className="text-zinc-400 flex items-center gap-4">
          <span>{formatDate(currentTime)}</span>
          <span className="text-violet-400 font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* FROG */}
      {frogTask && (
        <Card className="mb-6 bg-gradient-to-r from-violet-900/20 to-violet-800/20 border-violet-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-violet-400" />
              <div>
                <CardTitle className="text-violet-100">Today&apos;s FROG</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-white">{frogTask.title}</div>
            <Badge className="mt-2 bg-violet-600 hover:bg-violet-700">{frogTask.goal}</Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Sprint */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <CheckSquare className="h-5 w-5 text-violet-400" />
              This Week&apos;s Sprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sprintTasks.map((task, i) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-xs font-mono text-zinc-500 w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] ${
                    task.priority === 'frog' ? 'bg-violet-500/20 text-violet-400' :
                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {sprintTasks.length === 0 && (
                <p className="text-sm text-zinc-500">No active sprint tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Handshake className="h-5 w-5 text-violet-400" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                  <Badge className={`${PRIORITY_COLORS[lead.priority]} text-[10px]`}>
                    {lead.priority}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{lead.name}{lead.company ? ` · ${lead.company}` : ''}</p>
                    <p className="text-xs text-zinc-500 truncate">{lead.nextAction}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {daysSince(lead.lastContact)}d
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-zinc-500">No leads yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blockers */}
        {allBlockers.length > 0 && (
          <Card className="bg-zinc-900 border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400 text-base">
                <AlertTriangle className="h-5 w-5" />
                Blockers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allBlockers.map((b, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-red-950/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white">{b.text}</p>
                      <p className="text-xs text-zinc-500">{b.project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickWins.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <p className="text-sm text-white truncate">{task.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Goals Progress */}
      <Card className="mt-6 bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Target className="h-5 w-5 text-violet-400" />
            Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="flex items-center gap-4">
                <span className="text-2xl">{goal.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{goal.title}</span>
                    <span className="text-sm text-zinc-400">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react'

interface Task {
  id: string
  title: string
  status: 'backlog' | 'today' | 'in-progress' | 'done'
  priority: 'frog' | 'high' | 'medium' | 'low'
  goal: 'mind' | 'business' | 'body' | null
  dueDate: string | null
  completed: boolean
  completedAt: string | null
}

interface Goal {
  id: 'mind' | 'business' | 'body'
  title: string
  emoji: string
  description: string
  progress: number
  color: string
}

interface ActivityItem {
  id: string
  type: 'session' | 'task_completion'
  title: string
  description: string
  timestamp: string
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon' 
  return 'Good evening'
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, goalsRes, activityRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/goals'),
          fetch('/api/activity')
        ])

        const tasksData = await tasksRes.json()
        const goalsData = await goalsRes.json()
        const activityData = await activityRes.json()

        setTasks(tasksData.tasks || [])
        setGoals(goalsData.goals || [])
        setActivities(activityData.activities || [])
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
          <div className="h-4 bg-zinc-700 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => 
    task.status === 'today' || 
    task.status === 'in-progress' ||
    (task.dueDate && task.dueDate.startsWith(today))
  )

  // Get the FROG (most important task)
  const frogTask = todayTasks.find(task => task.priority === 'frog')

  // Calculate stats
  const completedToday = tasks.filter(task => 
    task.completed && 
    task.completedAt &&
    new Date(task.completedAt).toDateString() === new Date().toDateString()
  ).length

  const totalToday = todayTasks.length
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {getTimeOfDayGreeting()}, Owen
        </h1>
        <div className="text-zinc-400">
          <div className="flex items-center gap-4">
            <span>{formatDate(currentTime)}</span>
            <span className="text-violet-400 font-mono">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>

      {/* FROG Task */}
      {frogTask && !frogTask.completed && (
        <Card className="mb-8 bg-gradient-to-r from-violet-900/20 to-violet-800/20 border-violet-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-violet-400" />
              <div>
                <CardTitle className="text-violet-100">Today's FROG</CardTitle>
                <CardDescription className="text-violet-300">
                  Finish the Riskiest Outcome Goal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-white">
              {frogTask.title}
            </div>
            {frogTask.goal && (
              <Badge className="mt-2 bg-violet-600 hover:bg-violet-700">
                {frogTask.goal}
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {completedToday}/{totalToday}
            </div>
            <Progress 
              value={completionRate} 
              className="mt-2 h-2 bg-zinc-700"
            />
            <p className="text-xs text-zinc-400 mt-2">
              {completionRate}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-zinc-400">in progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Completed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.completed).length}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-xs text-zinc-400">tasks done</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Avg. Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              <p className="text-xs text-zinc-400">across all goals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Overview */}
      <Card className="mb-8 bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
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
                    <span className="text-sm font-medium text-white">
                      {goal.title}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className="h-2 bg-zinc-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-violet-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800">
                <div className="flex-shrink-0 w-2 h-2 bg-violet-400 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
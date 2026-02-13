'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Edit, 
  TrendingUp, 
  CheckCircle2,
  Calendar,
  BarChart3
} from 'lucide-react'

interface Goal {
  id: 'mind' | 'business' | 'body'
  title: string
  emoji: string
  description: string
  progress: number
  color: string
  updatedAt?: string
}

interface Task {
  id: string
  title: string
  goal: 'mind' | 'business' | 'body' | null
  status: 'backlog' | 'today' | 'in-progress' | 'done'
  completed: boolean
}

const GOAL_GRADIENT_CLASSES = {
  mind: 'bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/30',
  business: 'bg-gradient-to-br from-emerald-600/20 to-green-600/20 border-emerald-500/30',
  body: 'bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30'
}

const PROGRESS_COLORS = {
  mind: 'bg-violet-500',
  business: 'bg-emerald-500', 
  body: 'bg-orange-500'
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [tempProgress, setTempProgress] = useState<number>(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [goalsRes, tasksRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/tasks')
      ])

      const goalsData = await goalsRes.json()
      const tasksData = await tasksRes.json()

      setGoals(goalsData.goals || [])
      setTasks(tasksData.tasks || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateGoalProgress(goalId: string, progress: number) {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, progress })
      })

      if (response.ok) {
        await fetchData()
        setEditingGoal(null)
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  function getGoalTasks(goalId: string) {
    return tasks.filter(task => task.goal === goalId)
  }

  function getCompletedTasks(goalId: string) {
    return getGoalTasks(goalId).filter(task => task.completed)
  }

  function getProgressDescription(progress: number) {
    if (progress < 25) return 'Getting started'
    if (progress < 50) return 'Making progress'
    if (progress < 75) return 'Going strong'
    if (progress < 100) return 'Almost there!'
    return 'Goal achieved!'
  }

  function getProgressColor(progress: number) {
    if (progress < 25) return 'text-red-400'
    if (progress < 50) return 'text-yellow-400'
    if (progress < 75) return 'text-blue-400'
    return 'text-green-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-zinc-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Goals</h1>
        <p className="text-zinc-400">
          Track your progress across life's key areas
        </p>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {goals.map(goal => {
          const goalTasks = getGoalTasks(goal.id)
          const completedTasks = getCompletedTasks(goal.id)
          const progressDescription = getProgressDescription(goal.progress)

          return (
            <Card key={goal.id} className={`${GOAL_GRADIENT_CLASSES[goal.id]} relative overflow-hidden`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{goal.emoji}</span>
                    <div>
                      <CardTitle className="text-xl text-white">
                        {goal.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-300 text-sm mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Dialog 
                    open={editingGoal?.id === goal.id} 
                    onOpenChange={(open) => {
                      if (open) {
                        setEditingGoal(goal)
                        setTempProgress(goal.progress)
                      } else {
                        setEditingGoal(null)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-700">
                      <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                          <span className="text-2xl">{goal.emoji}</span>
                          Update {goal.title} Progress
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          Adjust your progress for this goal
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Progress</Label>
                            <span className="text-xl font-bold text-white">{tempProgress}%</span>
                          </div>
                          <Slider
                            value={[tempProgress]}
                            onValueChange={([value]) => setTempProgress(value)}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <div className="text-center">
                            <span className={`text-sm font-medium ${getProgressColor(tempProgress)}`}>
                              {getProgressDescription(tempProgress)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingGoal(null)}
                            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => updateGoalProgress(goal.id, tempProgress)}
                            className="bg-violet-600 hover:bg-violet-700"
                          >
                            Update Progress
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-300">Progress</span>
                      <span className="text-lg font-bold text-white">{goal.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={goal.progress} 
                        className="h-3 bg-zinc-700"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-3 ${PROGRESS_COLORS[goal.id]} rounded-full transition-all`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${getProgressColor(goal.progress)}`}>
                      {progressDescription}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {completedTasks.length}
                      </div>
                      <div className="text-xs text-zinc-400">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {goalTasks.length}
                      </div>
                      <div className="text-xs text-zinc-400">Total Tasks</div>
                    </div>
                  </div>

                  {/* Related Tasks */}
                  {goalTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Related Tasks
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {goalTasks.slice(0, 5).map(task => (
                          <div key={task.id} className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded text-sm">
                            <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-400' : 'bg-zinc-500'}`} />
                            <span className={`flex-1 ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {goalTasks.length > 5 && (
                          <p className="text-xs text-zinc-500 text-center">
                            +{goalTasks.length - 5} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  {goal.updatedAt && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      Updated {new Date(goal.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            Goals Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
              </div>
              <p className="text-zinc-400 text-sm">Average Progress</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {goals.filter(goal => goal.progress >= 75).length}
              </div>
              <p className="text-zinc-400 text-sm">Goals Above 75%</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {tasks.filter(task => task.goal && task.completed).length}
              </div>
              <p className="text-zinc-400 text-sm">Goal Tasks Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
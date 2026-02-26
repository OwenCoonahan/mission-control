'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Edit, 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 bg-zinc-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Goals</h1>
        <p className="text-sm text-zinc-500 mt-1">Track progress across key areas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {goals.map(goal => {
          const goalTasks = getGoalTasks(goal.id)
          const completedTasks = getCompletedTasks(goal.id)

          return (
            <Card key={goal.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-white">{goal.title}</CardTitle>
                    <p className="text-sm text-zinc-500 mt-1">{goal.description}</p>
                  </div>
                  <Dialog 
                    open={editingGoal?.id === goal.id} 
                    onOpenChange={(open) => {
                      if (open) { setEditingGoal(goal); setTempProgress(goal.progress) }
                      else setEditingGoal(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-300">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Update {goal.title}</DialogTitle>
                        <DialogDescription className="text-zinc-500">Adjust your progress</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-zinc-300">Progress</Label>
                            <span className="text-lg font-semibold text-white">{tempProgress}%</span>
                          </div>
                          <Slider
                            value={[tempProgress]}
                            onValueChange={([value]) => setTempProgress(value)}
                            max={100}
                            step={5}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingGoal(null)} className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">Cancel</Button>
                          <Button onClick={() => updateGoalProgress(goal.id, tempProgress)} className="bg-violet-600 hover:bg-violet-700">Update</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500">Progress</span>
                    <span className="text-sm font-semibold text-white">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center py-3 bg-zinc-800/40 rounded-md">
                    <div className="text-lg font-semibold text-white">{completedTasks.length}</div>
                    <div className="text-xs text-zinc-500">Completed</div>
                  </div>
                  <div className="text-center py-3 bg-zinc-800/40 rounded-md">
                    <div className="text-lg font-semibold text-white">{goalTasks.length}</div>
                    <div className="text-xs text-zinc-500">Total</div>
                  </div>
                </div>

                {goalTasks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Tasks
                    </h4>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {goalTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                          <span className={`flex-1 ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {goalTasks.length > 5 && (
                        <p className="text-xs text-zinc-600 text-center">+{goalTasks.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {goal.updatedAt && (
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <Calendar className="h-3 w-3" />
                    Updated {new Date(goal.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-200 text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-zinc-500" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">
                {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
              </div>
              <p className="text-xs text-zinc-500 mt-1">Average Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">
                {goals.filter(goal => goal.progress >= 75).length}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Above 75%</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">
                {tasks.filter(task => task.goal && task.completed).length}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Tasks Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

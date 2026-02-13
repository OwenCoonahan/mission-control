'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Star, 
  Calendar, 
  Target,
  MoreHorizontal,
  Trash2,
  Edit,
  CheckCircle2
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Task {
  id: string
  title: string
  status: 'backlog' | 'today' | 'in-progress' | 'done'
  priority: 'frog' | 'high' | 'medium' | 'low'
  goal: 'mind' | 'business' | 'body' | null
  dueDate: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

interface NewTask {
  title: string
  goal: 'mind' | 'business' | 'body' | null
  priority: 'frog' | 'high' | 'medium' | 'low'
  dueDate: string
  status: 'backlog' | 'today' | 'in-progress' | 'done'
}

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-zinc-800' },
  { id: 'today', title: 'Today', color: 'bg-blue-900/20' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-900/20' }
] as const

const PRIORITY_COLORS = {
  frog: 'bg-violet-600 hover:bg-violet-700 text-white',
  high: 'bg-red-600 hover:bg-red-700 text-white',
  medium: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  low: 'bg-green-600 hover:bg-green-700 text-white'
}

const GOAL_COLORS = {
  mind: 'bg-violet-600 hover:bg-violet-700 text-white',
  business: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  body: 'bg-orange-600 hover:bg-orange-700 text-white'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    goal: null,
    priority: 'medium',
    dueDate: '',
    status: 'backlog'
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createTask() {
    if (!newTask.title.trim()) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })

      if (response.ok) {
        await fetchTasks()
        setNewTask({
          title: '',
          goal: null,
          priority: 'medium',
          dueDate: '',
          status: 'backlog'
        })
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchTasks()
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  async function deleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function getTasksByStatus(status: string) {
    return tasks.filter(task => task.status === status)
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-zinc-400 mt-1">
            Manage your goals and priorities
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Task</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new task to your workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="frog">FROG 🐸</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Goal</Label>
                  <Select
                    value={newTask.goal || ''}
                    onValueChange={(value) => setNewTask({ ...newTask, goal: (value as 'mind' | 'business' | 'body') || null })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="mind">🧘 Calm Mind</SelectItem>
                      <SelectItem value="business">📈 Grow Business</SelectItem>
                      <SelectItem value="body">💪 Greek God Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createTask}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {column.title}
              </h2>
              <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                {getTasksByStatus(column.id).length}
              </Badge>
            </div>

            <div className="space-y-3 flex-1">
              {getTasksByStatus(column.id).map(task => (
                <Card key={task.id} className={`${column.color} border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm text-white pr-2">
                        {task.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuItem
                            onClick={() => setEditingTask(task)}
                            className="text-zinc-300 hover:text-white hover:bg-zinc-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteTask(task.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-zinc-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.priority === 'frog' && (
                        <Badge className={PRIORITY_COLORS[task.priority]}>
                          <Star className="h-3 w-3 mr-1" />
                          FROG
                        </Badge>
                      )}
                      {task.priority !== 'frog' && (
                        <Badge className={PRIORITY_COLORS[task.priority]}>
                          {task.priority}
                        </Badge>
                      )}
                      
                      {task.goal && (
                        <Badge className={GOAL_COLORS[task.goal]}>
                          <Target className="h-3 w-3 mr-1" />
                          {task.goal}
                        </Badge>
                      )}

                      {task.dueDate && (
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <Select
                        value={task.status}
                        onValueChange={(newStatus) => updateTask(task.id, { status: newStatus as any })}
                      >
                        <SelectTrigger className="w-24 h-7 bg-zinc-700 border-zinc-600 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="in-progress">Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>

                      {task.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
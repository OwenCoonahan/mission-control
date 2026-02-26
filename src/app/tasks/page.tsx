'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
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
  { id: 'backlog', title: 'Backlog' },
  { id: 'today', title: 'Today' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
] as const

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

  useEffect(() => { fetchTasks() }, [])

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
        setNewTask({ title: '', goal: null, priority: 'medium', dueDate: '', status: 'backlog' })
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
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (response.ok) await fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function getTasksByStatus(status: string) {
    return tasks.filter(task => task.status === status)
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your priorities</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">New Task</DialogTitle>
              <DialogDescription className="text-zinc-500">Add a task to your workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs">Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="frog">FROG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Goal</Label>
                  <Select value={newTask.goal || ''} onValueChange={(value) => setNewTask({ ...newTask, goal: (value as any) || null })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select goal" /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="mind">Calm Mind</SelectItem>
                      <SelectItem value="business">Grow Business</SelectItem>
                      <SelectItem value="body">Greek God Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Status</Label>
                  <Select value={newTask.status} onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-xs">Due Date</Label>
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 text-xs">Cancel</Button>
                <Button onClick={createTask} className="bg-violet-600 hover:bg-violet-700 h-8 text-xs">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-zinc-400">{column.title}</h2>
              <span className="text-xs text-zinc-600">{getTasksByStatus(column.id).length}</span>
            </div>

            <div className="space-y-2 flex-1">
              {getTasksByStatus(column.id).map(task => (
                <Card key={task.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-zinc-200 pr-2">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-zinc-600 hover:text-zinc-300">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem onClick={() => setEditingTask(task)} className="text-zinc-300 hover:bg-zinc-800">
                            <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-400 hover:bg-zinc-800">
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        task.priority === 'frog' ? 'bg-violet-500/15 text-violet-400' :
                        task.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                        task.priority === 'medium' ? 'bg-zinc-800 text-zinc-400' :
                        'text-zinc-600'
                      }`}>
                        {task.priority}
                      </span>
                      {task.goal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {task.goal}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <Select value={task.status} onValueChange={(newStatus) => updateTask(task.id, { status: newStatus as any })}>
                        <SelectTrigger className="w-20 h-6 bg-zinc-800 border-zinc-700 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="in-progress">Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      {task.completed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
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

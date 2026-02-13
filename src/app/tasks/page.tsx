'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Clock,
  Brain,
  Dumbbell,
  Briefcase,
  Trash2,
  Edit,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckSquare,
  FileText,
  FolderKanban,
  BookOpen,
  Users,
  Settings,
  Target,
  PanelLeft,
  Star,
} from 'lucide-react';
import Link from 'next/link';

// Types
type Task = {
  id: string;
  title: string;
  goal: 'mind' | 'business' | 'body' | null;
  priority: 'frog' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'today' | 'in-progress' | 'done';
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type TaskFormData = {
  title: string;
  goal: 'mind' | 'business' | 'body';
  priority: 'frog' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'today' | 'in-progress' | 'done';
  dueDate: string;
};

const statusConfig = {
  backlog: { label: 'Backlog', color: 'gray' },
  today: { label: 'Today', color: 'blue' },
  'in-progress': { label: 'In Progress', color: 'yellow' },
  done: { label: 'Done', color: 'green' },
};

const goalConfig = {
  mind: { label: 'Calm Mind', color: 'violet', icon: Brain },
  business: { label: 'Grow Business', color: 'emerald', icon: Briefcase },
  body: { label: 'Greek God Body', color: 'orange', icon: Dumbbell },
};

const navItems = [
  { icon: Target, label: 'Dashboard', href: '/', active: false },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks', active: true },
  { icon: FileText, label: 'Content', href: '/content', active: false },
  { icon: Calendar, label: 'Calendar', href: '/calendar', active: false },
  { icon: FolderKanban, label: 'Projects', href: '/projects', active: false },
  { icon: Brain, label: 'Memory', href: '/memory', active: false },
  { icon: BookOpen, label: 'Docs', href: '/docs', active: false },
  { icon: Users, label: 'People', href: '/people', active: false },
];

function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onMove 
}: { 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: Task['status']) => void;
}) {
  const goal = task.goal ? goalConfig[task.goal] : null;
  const GoalIcon = goal?.icon || Briefcase;
  
  const priorityStyles = {
    frog: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  };
  
  const goalColorStyles = {
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  };
  
  const goalStyle = goal ? goalColorStyles[goal.color as keyof typeof goalColorStyles] : null;
  
  const statusOrder: Task['status'][] = ['backlog', 'today', 'in-progress', 'done'];
  const currentIndex = statusOrder.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < statusOrder.length - 1;
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div 
      className="group relative rounded-xl p-4 cursor-pointer transition-all duration-200 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 shadow-xl"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {task.priority === 'frog' && (
              <Star className="h-4 w-4 text-purple-400 fill-purple-400 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-zinc-100 font-medium leading-snug pr-2">{task.title}</p>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className={`text-xs font-semibold px-2 py-0.5 border ${priorityStyles[task.priority]}`}>
              {task.priority === 'frog' ? '🐸 frog' : task.priority}
            </Badge>
            {goal && goalStyle && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${goalStyle.bg} ${goalStyle.border}`}>
                <GoalIcon className={`h-3 w-3 ${goalStyle.text}`} />
                <span className={`text-xs font-semibold ${goalStyle.text}`}>{goal.label}</span>
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1.5 mt-3 text-zinc-500 text-xs">
              <Clock className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-700">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-700" />
            {canMoveLeft && (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onMove(task.id, statusOrder[currentIndex - 1]); }}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Move to {statusConfig[statusOrder[currentIndex - 1]].label}
              </DropdownMenuItem>
            )}
            {canMoveRight && (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onMove(task.id, statusOrder[currentIndex + 1]); }}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Move to {statusConfig[statusOrder[currentIndex + 1]].label}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-zinc-700" />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function KanbanColumn({ 
  title, 
  tasks: columnTasks, 
  status,
  color,
  onEdit,
  onDelete,
  onMove,
}: { 
  title: string; 
  tasks: Task[]; 
  status: Task['status'];
  color: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: Task['status']) => void;
}) {
  const colorStyles: Record<string, { dot: string }> = {
    gray: { dot: 'bg-zinc-400' },
    blue: { dot: 'bg-blue-400' },
    yellow: { dot: 'bg-amber-400' },
    green: { dot: 'bg-emerald-400' },
  };
  
  const style = colorStyles[color];
  
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md font-semibold border border-zinc-700">
            {columnTasks.length}
          </span>
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {columnTasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
        {columnTasks.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-600 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (data: TaskFormData, id?: string) => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    goal: 'business',
    priority: 'medium',
    status: 'backlog',
    dueDate: new Date().toISOString().split('T')[0],
  });
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        goal: task.goal || 'business',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        goal: 'business',
        priority: 'medium',
        status: 'backlog',
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [task, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData, task?.id);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {task ? 'Update the task details below.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">Title</Label>
            <Textarea
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500/50 min-h-[80px] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Goal</Label>
              <Select 
                value={formData.goal} 
                onValueChange={(value: Task['goal'] & string) => setFormData({ ...formData, goal: value as 'mind' | 'business' | 'body' })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="mind" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-violet-400" />
                      Calm Mind
                    </div>
                  </SelectItem>
                  <SelectItem value="business" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-400" />
                      Grow Business
                    </div>
                  </SelectItem>
                  <SelectItem value="body" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-orange-400" />
                      Greek God Body
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-300">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="frog" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <span className="text-purple-400">🐸 Frog (Most Important)</span>
                  </SelectItem>
                  <SelectItem value="high" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <span className="text-red-400">High</span>
                  </SelectItem>
                  <SelectItem value="medium" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <span className="text-amber-400">Medium</span>
                  </SelectItem>
                  <SelectItem value="low" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <span className="text-sky-400">Low</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="backlog" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">Backlog</SelectItem>
                  <SelectItem value="today" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">Today</SelectItem>
                  <SelectItem value="in-progress" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">In Progress</SelectItem>
                  <SelectItem value="done" className="text-zinc-300 focus:bg-zinc-800 focus:text-white">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-300">Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 pt-4">
            {task && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(task.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // API returns {tasks: [], streak: N}
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = async (formData: TaskFormData, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        // Update existing task via PUT /api/tasks/[id]
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();
        setTasks(tasks.map(t => t.id === id ? updated : t));
      } else {
        // Create new task via POST /api/tasks
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create');
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
      }
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      // DELETE /api/tasks/[id]
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setTasks(tasks.filter(t => t.id !== id));
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (id: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    try {
      // PUT /api/tasks/[id]
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setTasks(tasks);
        throw new Error('Failed to move');
      }
      // Update with server response
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  // Filter tasks by search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tasks by status
  const tasksByStatus = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    today: filteredTasks.filter(t => t.status === 'today'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-zinc-950 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-950">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-zinc-800 bg-zinc-900 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Mission Control</p>
              <p className="text-xs text-zinc-500">Owen&apos;s HQ</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-bold mb-3 px-3">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/25">
              OC
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Owen</p>
              <p className="text-xs text-zinc-500">Personal</p>
            </div>
            <Settings className="h-4 w-4 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-zinc-700" />
            <div>
              <h1 className="text-xl font-bold text-white">Tasks</h1>
              <p className="text-sm text-zinc-500">
                {tasks.length} total • {tasksByStatus['in-progress'].length} in progress
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>
            <Button variant="outline" size="icon" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleNewTask}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/30 border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex gap-5 min-w-max">
            <KanbanColumn 
              title="Backlog" 
              tasks={tasksByStatus.backlog} 
              status="backlog"
              color="gray" 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
            <KanbanColumn 
              title="Today" 
              tasks={tasksByStatus.today} 
              status="today"
              color="blue" 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
            <KanbanColumn 
              title="In Progress" 
              tasks={tasksByStatus['in-progress']} 
              status="in-progress"
              color="yellow" 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
            <KanbanColumn 
              title="Done" 
              tasks={tasksByStatus.done} 
              status="done"
              color="green" 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          </div>
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        isLoading={isSaving}
      />
    </div>
  );
}

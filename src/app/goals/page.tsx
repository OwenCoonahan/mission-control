'use client';

import { useState, useEffect } from 'react';
import { 
  Target, 
  Brain, 
  Briefcase, 
  Dumbbell, 
  Pencil, 
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

// Types
interface Goal {
  id: 'mind' | 'business' | 'body';
  title: string;
  progress: number;
  target: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  goal: 'mind' | 'business' | 'body';
  priority: 'high' | 'medium' | 'low';
  status: 'backlog' | 'today' | 'in-progress' | 'done';
  dueDate: string;
}

// Goal configuration
const goalConfig = {
  mind: {
    icon: Brain,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/15',
    borderColor: 'border-violet-500/30',
    textColor: 'text-violet-400',
    progressBg: 'bg-gradient-to-r from-violet-500 to-purple-400',
    hoverBorder: 'hover:border-violet-500/50',
  },
  business: {
    icon: Briefcase,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  body: {
    icon: Dumbbell,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    progressBg: 'bg-gradient-to-r from-orange-500 to-amber-400',
    hoverBorder: 'hover:border-orange-500/50',
  },
};

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Priority badge styles
const priorityStyles = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

// Status badge styles
const statusStyles = {
  'backlog': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  'today': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'done': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // Fetch goals and tasks
  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes, tasksRes] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/tasks'),
        ]);
        
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json();
          setGoals(goalsData);
        }
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Open edit modal
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditProgress(goal.progress);
  };

  // Save progress
  const handleSave = async () => {
    if (!editingGoal) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGoal.id,
          progress: editProgress,
        }),
      });
      
      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
        setEditingGoal(null);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  // Get tasks for a specific goal
  const getGoalTasks = (goalId: string) => {
    return tasks.filter(t => t.goal === goalId && t.status !== 'done').slice(0, 3);
  };

  // Calculate overall progress
  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Target className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Goals</h1>
            <p className="text-zinc-500">Track your progress toward your life goals</p>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="flex items-center gap-4 px-6 py-4 bg-zinc-900 rounded-2xl border border-zinc-700">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Overall Progress</p>
            <p className="text-3xl font-bold text-white">{overallProgress}%</p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 2.51} 251`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const config = goalConfig[goal.id];
          const Icon = config.icon;
          const relatedTasks = getGoalTasks(goal.id);
          
          return (
            <Card 
              key={goal.id} 
              className={`bg-zinc-900 border-zinc-700 ${config.hoverBorder} transition-all duration-300 shadow-xl overflow-hidden`}
            >
              {/* Color accent bar at top */}
              <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                      <Icon className={`h-7 w-7 ${config.textColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">{goal.title}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 text-zinc-500 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Updated {formatDate(goal.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(goal)}
                    className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-zinc-400">Progress</span>
                    <span className={`text-2xl font-bold ${config.textColor}`}>{goal.progress}%</span>
                  </div>
                  <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${config.progressBg} rounded-full transition-all duration-500`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                
                {/* Target Section */}
                <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Target</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">{goal.target}</p>
                </div>
                
                {/* Related Tasks Section */}
                {relatedTasks.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Active Tasks</p>
                    <div className="space-y-2">
                      {relatedTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
                        >
                          <div className={`h-8 w-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                            <CheckCircle2 className={`h-4 w-4 ${config.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-200 truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 border ${priorityStyles[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className={`text-xs px-1.5 py-0 border ${statusStyles[task.status]}`}>
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {relatedTasks.length === 0 && (
                  <div className="py-4 text-center text-zinc-500 text-sm">
                    No active tasks for this goal
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Progress Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white sm:max-w-md">
          {editingGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {(() => {
                    const config = goalConfig[editingGoal.id];
                    const Icon = config.icon;
                    return (
                      <>
                        <div className={`h-10 w-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${config.textColor}`} />
                        </div>
                        <span>Update {editingGoal.title}</span>
                      </>
                    );
                  })()}
                </DialogTitle>
                <DialogDescription className="text-zinc-500">
                  Adjust your progress for this goal
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6 space-y-6">
                {/* Progress Display */}
                <div className="text-center">
                  <span className={`text-6xl font-bold ${goalConfig[editingGoal.id].textColor}`}>
                    {editProgress}%
                  </span>
                </div>
                
                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[editProgress]}
                    onValueChange={(value) => setEditProgress(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                {/* Quick buttons */}
                <div className="flex justify-center gap-2">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setEditProgress(val)}
                      className={`text-xs border-zinc-700 hover:bg-zinc-800 ${
                        editProgress === val ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                      }`}
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
                
                {/* Last updated */}
                <div className="text-center text-xs text-zinc-500">
                  Last updated: {new Date(editingGoal.updatedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingGoal(null)}
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className={`bg-gradient-to-r ${goalConfig[editingGoal.id].gradient} text-white hover:opacity-90`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Progress'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

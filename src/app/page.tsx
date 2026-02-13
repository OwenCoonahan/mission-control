'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Brain,
  Dumbbell,
  Briefcase,
  Clock,
  Sparkles,
} from 'lucide-react';

// Types
type Task = {
  id: string;
  title: string;
  goal: 'mind' | 'business' | 'body';
  status: 'today' | 'backlog' | 'done';
  priority: 'frog' | 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
};

type Goal = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  progress: number;
  color: 'violet' | 'emerald' | 'orange';
};

type TasksData = {
  tasks: Task[];
  streak: number;
};

type GoalsData = {
  goals: Goal[];
};

// Goal styling config
const goalConfig = {
  mind: { icon: Brain, gradient: 'from-violet-500 to-purple-600' },
  business: { icon: Briefcase, gradient: 'from-emerald-500 to-teal-600' },
  body: { icon: Dumbbell, gradient: 'from-orange-500 to-amber-600' },
};

const colorStyles = {
  violet: {
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    progress: 'bg-violet-500',
  },
  emerald: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    progress: 'bg-emerald-500',
  },
  orange: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    progress: 'bg-orange-500',
  },
};

const priorityLabels: Record<string, string> = {
  frog: '🐸 FROG',
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '⚪ Low',
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasksData, setTasksData] = useState<TasksData | null>(null);
  const [goalsData, setGoalsData] = useState<GoalsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, goalsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/goals'),
        ]);
        
        const tasks = await tasksRes.json();
        const goals = await goalsRes.json();
        
        setTasksData(tasks);
        setGoalsData(goals);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Greeting based on time
  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Compute stats
  const todayTasks = tasksData?.tasks.filter(t => t.status === 'today') || [];
  const frogTask = todayTasks.find(t => t.priority === 'frog');
  const otherTodayTasks = todayTasks.filter(t => t.priority !== 'frog');
  
  // Calculate tasks completed this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const completedThisWeek = tasksData?.tasks.filter(t => {
    if (!t.completedAt) return false;
    const completedDate = new Date(t.completedAt);
    return completedDate >= weekStart;
  }).length || 0;
  
  const totalTasks = tasksData?.tasks.length || 0;
  const streak = tasksData?.streak || 0;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-white">{greeting()}, Owen</h1>
            <p className="text-sm text-zinc-500">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <Link href="/tasks">
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-zinc-900 border-zinc-700">
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-24 mb-2 bg-zinc-800" />
                    <Skeleton className="h-8 w-16 bg-zinc-800" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">This Week</p>
                      <p className="text-3xl font-bold text-white mt-1">{completedThisWeek}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Today&apos;s Tasks</p>
                      <p className="text-3xl font-bold text-white mt-1">{todayTasks.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Tasks</p>
                      <p className="text-3xl font-bold text-white mt-1">{totalTasks}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Target className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-700">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Streak</p>
                      <p className="text-3xl font-bold text-white mt-1">{streak} days</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Focus - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* FROG - The Big Task */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">🐸</span> Today&apos;s FROG
                  <span className="text-xs text-zinc-500 font-normal ml-2">Eat the frog first!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full bg-zinc-800" />
                ) : frogTask ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-4">
                      {frogTask.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-zinc-500" />
                      )}
                      <div className="flex-1">
                        <p className={`text-lg font-semibold ${frogTask.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {frogTask.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-emerald-400">{priorityLabels[frogTask.priority]}</span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span className="text-xs text-zinc-500">Due: {new Date(frogTask.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-4">No FROG task set for today. Add one!</p>
                )}
              </CardContent>
            </Card>

            {/* Other Today Tasks */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  📋 Today&apos;s Tasks
                  {!loading && (
                    <span className="text-xs text-zinc-500 font-normal">
                      {todayTasks.filter(t => t.completed).length}/{todayTasks.length} done
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-14 w-full bg-zinc-800" />
                    ))}
                  </div>
                ) : otherTodayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {otherTodayTasks.map(task => {
                      const config = goalConfig[task.goal];
                      const GoalIcon = config.icon;
                      const goalColor = task.goal === 'mind' ? 'violet' : task.goal === 'business' ? 'emerald' : 'orange';
                      
                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-zinc-500 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-500">{priorityLabels[task.priority]}</span>
                                <span className="text-xs text-zinc-600">•</span>
                                <div className="flex items-center gap-1">
                                  <GoalIcon className={`h-3 w-3 ${colorStyles[goalColor].text}`} />
                                  <span className="text-xs text-zinc-500 capitalize">{task.goal}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-4">No other tasks for today.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Goals & Activity */}
          <div className="space-y-6">
            {/* Goals Progress */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  🎯 Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-zinc-800" />
                        <Skeleton className="h-3 w-full bg-zinc-800" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goalsData?.goals.map(goal => {
                      const style = colorStyles[goal.color];
                      const config = goalConfig[goal.id as keyof typeof goalConfig];
                      const GoalIcon = config?.icon || Target;
                      
                      return (
                        <Link href="/goals" key={goal.id}>
                          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer group mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`h-10 w-10 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center`}>
                                <GoalIcon className={`h-5 w-5 ${style.text}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                                    {goal.emoji} {goal.title}
                                  </span>
                                  <span className={`text-sm font-bold ${style.text}`}>{goal.progress}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${style.progress} rounded-full transition-all duration-500`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">{goal.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Placeholder */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <>
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-zinc-500 text-sm">Activity feed coming soon...</p>
                      <p className="text-zinc-600 text-xs mt-1">Track your progress over time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

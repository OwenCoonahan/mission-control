'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  Dumbbell,
  Briefcase,
  GripVertical,
} from 'lucide-react';

// Task type
type Task = {
  id: string;
  title: string;
  goal: 'mind' | 'business' | 'body';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
};

// Mock data for tasks
const tasks: { backlog: Task[]; inProgress: Task[]; done: Task[] } = {
  backlog: [
    { id: '1', title: 'Research AI automation tools', goal: 'business', priority: 'high', dueDate: 'Feb 15' },
    { id: '2', title: 'Plan content calendar for Q1', goal: 'business', priority: 'medium', dueDate: 'Feb 18' },
    { id: '3', title: 'Book meditation retreat', goal: 'mind', priority: 'low', dueDate: 'Mar 1' },
  ],
  inProgress: [
    { id: '4', title: 'Complete strength training program', goal: 'body', priority: 'high', dueDate: 'Feb 14' },
    { id: '5', title: 'Finalize client proposal', goal: 'business', priority: 'high', dueDate: 'Feb 13' },
    { id: '6', title: 'Daily meditation - 20 mins', goal: 'mind', priority: 'medium', dueDate: 'Today' },
  ],
  done: [
    { id: '7', title: 'Morning workout routine', goal: 'body', priority: 'high', dueDate: 'Feb 12' },
    { id: '8', title: 'Review weekly metrics', goal: 'business', priority: 'medium', dueDate: 'Feb 12' },
    { id: '9', title: 'Journaling session', goal: 'mind', priority: 'low', dueDate: 'Feb 11' },
  ],
};

// Mock activity data
const activities = [
  { id: '1', action: 'Completed task', detail: 'Morning workout routine', time: '2h ago', icon: CheckCircle2 },
  { id: '2', action: 'Added note', detail: 'New business insights captured', time: '3h ago', icon: Brain },
  { id: '3', action: 'Updated goal', detail: 'Greek God Body progress: 68%', time: '4h ago', icon: Target },
  { id: '4', action: 'Scheduled', detail: 'Client call for tomorrow', time: '5h ago', icon: Calendar },
  { id: '5', action: 'Achieved milestone', detail: 'Consistency streak: 7 days', time: '6h ago', icon: Zap },
  { id: '6', action: 'Completed task', detail: 'Review weekly metrics', time: '8h ago', icon: CheckCircle2 },
  { id: '7', action: 'Added task', detail: 'Research AI automation tools', time: '1d ago', icon: Plus },
];

const goalConfig = {
  mind: { label: 'Calm Mind', color: 'bg-violet-500', icon: Brain },
  business: { label: 'Grow Business', color: 'bg-emerald-500', icon: Briefcase },
  body: { label: 'Greek God Body', color: 'bg-orange-500', icon: Dumbbell },
};

const priorityConfig = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

function TaskCard({ task }: { task: Task }) {
  const goal = goalConfig[task.goal];
  const GoalIcon = goal.icon;
  const priorityClass = priorityConfig[task.priority];
  
  return (
    <Card className="bg-gray-800/50 border-white/10 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium leading-tight">{task.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={priorityClass}>
                {task.priority}
              </Badge>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${goal.color}/20`}>
                <GoalIcon className={`h-3 w-3 ${goal.color.replace('bg-', 'text-')}`} />
                <span className={`text-xs ${goal.color.replace('bg-', 'text-')}`}>{goal.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
              <Clock className="h-3 w-3" />
              <span>{task.dueDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ title, tasks: columnTasks, count, color }: { title: string; tasks: Task[]; count: number; color: string }) {
  return (
    <div className="flex flex-col min-w-[300px] w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-800/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">This Week</p>
              <p className="text-2xl font-bold text-white mt-1">12</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-white mt-1">3</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Tasks</p>
              <p className="text-2xl font-bold text-white mt-1">47</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/30 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Completion</p>
              <p className="text-2xl font-bold text-white mt-1">78%</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <Progress value={78} className="mt-2 h-1" />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeed() {
  return (
    <Card className="bg-gray-800/30 border-white/10 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Live Activity</CardTitle>
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="px-4 pb-4 space-y-1">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id}>
                  <div className="flex items-start gap-3 py-3 hover:bg-white/5 rounded-lg px-2 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-400 truncate">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{activity.time}</span>
                  </div>
                  {index < activities.length - 1 && <Separator className="bg-white/5" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function GoalsProgress() {
  const goals = [
    { key: 'mind', progress: 72 },
    { key: 'business', progress: 58 },
    { key: 'body', progress: 68 },
  ];

  return (
    <div className="flex gap-4 mb-6">
      {goals.map((goal) => {
        const config = goalConfig[goal.key as keyof typeof goalConfig];
        const Icon = config.icon;
        return (
          <Card key={goal.key} className="bg-gray-800/30 border-white/10 flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${config.color}/20 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{config.label}</p>
                    <span className="text-xs text-gray-400">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-400 hover:text-white" />
                <Separator orientation="vertical" className="h-6 bg-white/10" />
                <div>
                  <h1 className="text-xl font-semibold text-white">{greeting()}, Owen</h1>
                  <p className="text-sm text-gray-400">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search tasks..." 
                    className="w-64 pl-9 bg-gray-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Kanban Section */}
              <div className="flex-1 p-6 overflow-auto">
                <StatsBar />
                <GoalsProgress />
                
                {/* Kanban Board */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Task Board</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-white/10">
                        9 tasks
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    <KanbanColumn 
                      title="Backlog" 
                      tasks={tasks.backlog} 
                      count={tasks.backlog.length}
                      color="bg-gray-400"
                    />
                    <KanbanColumn 
                      title="In Progress" 
                      tasks={tasks.inProgress} 
                      count={tasks.inProgress.length}
                      color="bg-yellow-400"
                    />
                    <KanbanColumn 
                      title="Done" 
                      tasks={tasks.done} 
                      count={tasks.done.length}
                      color="bg-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Feed Sidebar */}
              <div className="w-80 border-l border-white/10 p-4">
                <ActivityFeed />
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}

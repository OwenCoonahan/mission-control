'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  CheckSquare,
  FileText,
  FolderKanban,
  BookOpen,
  Users,
  Settings,
  Sparkles,
  PanelLeft,
} from 'lucide-react';

// Types
type Task = {
  id: string;
  title: string;
  goal: 'mind' | 'business' | 'body';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
};

// Mock data
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

const activities = [
  { id: '1', action: 'Completed task', detail: 'Morning workout routine', time: '2h ago', icon: CheckCircle2 },
  { id: '2', action: 'Added note', detail: 'New business insights captured', time: '3h ago', icon: Brain },
  { id: '3', action: 'Updated goal', detail: 'Greek God Body progress: 68%', time: '4h ago', icon: Target },
  { id: '4', action: 'Scheduled', detail: 'Client call for tomorrow', time: '5h ago', icon: Calendar },
  { id: '5', action: 'Achieved milestone', detail: 'Consistency streak: 7 days', time: '6h ago', icon: Zap },
  { id: '6', action: 'Completed task', detail: 'Review weekly metrics', time: '8h ago', icon: CheckCircle2 },
];

const navItems = [
  { icon: CheckSquare, label: 'Tasks', active: true },
  { icon: FileText, label: 'Content', active: false },
  { icon: Calendar, label: 'Calendar', active: false },
  { icon: FolderKanban, label: 'Projects', active: false },
  { icon: Brain, label: 'Memory', active: false },
  { icon: BookOpen, label: 'Docs', active: false },
  { icon: Users, label: 'People', active: false },
];

const goalConfig = {
  mind: { label: 'Calm Mind', color: 'violet', icon: Brain },
  business: { label: 'Grow Business', color: 'emerald', icon: Briefcase },
  body: { label: 'Greek God Body', color: 'orange', icon: Dumbbell },
};

function TaskCard({ task }: { task: Task }) {
  const goal = goalConfig[task.goal];
  const GoalIcon = goal.icon;
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };
  
  const goalColorStyles = {
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };
  
  const goalStyle = goalColorStyles[goal.color as keyof typeof goalColorStyles];
  
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-all cursor-grab">
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-gray-600 mt-0.5 opacity-50" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">{task.title}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className={priorityStyles[task.priority]}>
              {task.priority}
            </Badge>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${goalStyle.bg}`}>
              <GoalIcon className={`h-3 w-3 ${goalStyle.text}`} />
              <span className={`text-xs ${goalStyle.text}`}>{goal.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-gray-500 text-xs">
            <Clock className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks: columnTasks, color }: { title: string; tasks: Task[]; color: string }) {
  const colorStyles: Record<string, string> = {
    gray: 'bg-gray-400',
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-400',
  };
  
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorStyles[color]}`} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full">{columnTasks.length}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const goals = [
    { key: 'mind', progress: 72 },
    { key: 'business', progress: 58 },
    { key: 'body', progress: 68 },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-[#1a1a1a] bg-[#111111] flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Mission Control</p>
              <p className="text-xs text-gray-500">Owen&apos;s HQ</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 px-2">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.active 
                      ? 'bg-violet-500/20 text-violet-400' 
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-medium">
              OC
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Owen</p>
              <p className="text-xs text-gray-500">Personal</p>
            </div>
            <Settings className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-[#2a2a2a]" />
            <div>
              <h1 className="text-xl font-semibold text-white">{greeting()}, Owen</h1>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search tasks..." 
                className="w-64 pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-600"
              />
            </div>
            <Button variant="outline" size="icon" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">This Week</p>
                    <p className="text-2xl font-bold text-white mt-1">12</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-bold text-white mt-1">3</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Tasks</p>
                    <p className="text-2xl font-bold text-white mt-1">47</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Completion</p>
                    <p className="text-2xl font-bold text-white mt-1">78%</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <Progress value={78} className="mt-3 h-1.5 bg-[#2a2a2a]" />
              </div>
            </div>

            {/* Goals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {goals.map((goal) => {
                const config = goalConfig[goal.key as keyof typeof goalConfig];
                const Icon = config.icon;
                const colorStyles: Record<string, { bg: string; text: string; progress: string }> = {
                  violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', progress: 'bg-violet-500' },
                  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', progress: 'bg-emerald-500' },
                  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', progress: 'bg-orange-500' },
                };
                const style = colorStyles[config.color];
                
                return (
                  <div key={goal.key} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${style.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${style.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">{config.label}</p>
                          <span className="text-xs text-gray-500">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div className={`h-full ${style.progress} transition-all`} style={{ width: `${goal.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kanban */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Task Board</h2>
                <Badge variant="outline" className="bg-[#1a1a1a] text-gray-400 border-[#2a2a2a]">
                  9 tasks
                </Badge>
              </div>
              
              <div className="flex gap-6">
                <KanbanColumn title="Backlog" tasks={tasks.backlog} color="gray" />
                <KanbanColumn title="In Progress" tasks={tasks.inProgress} color="yellow" />
                <KanbanColumn title="Done" tasks={tasks.done} color="green" />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="w-80 border-l border-[#1a1a1a] p-4 overflow-auto bg-[#0a0a0a]">
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl">
              <div className="p-4 border-b border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Live Activity</h3>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                    Live
                  </Badge>
                </div>
              </div>
              <div className="p-2 max-h-[600px] overflow-auto">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3 p-3 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                        <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                        </div>
                        <span className="text-xs text-gray-600 shrink-0">{activity.time}</span>
                      </div>
                      {index < activities.length - 1 && <div className="h-px bg-[#1a1a1a] mx-3" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

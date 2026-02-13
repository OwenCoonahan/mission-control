'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  { id: '1', action: 'Completed task', detail: 'Morning workout routine', time: '2h ago', icon: CheckCircle2, color: 'emerald' },
  { id: '2', action: 'Added note', detail: 'New business insights captured', time: '3h ago', icon: Brain, color: 'violet' },
  { id: '3', action: 'Updated goal', detail: 'Greek God Body progress: 68%', time: '4h ago', icon: Target, color: 'orange' },
  { id: '4', action: 'Scheduled', detail: 'Client call for tomorrow', time: '5h ago', icon: Calendar, color: 'blue' },
  { id: '5', action: 'Achieved milestone', detail: 'Consistency streak: 7 days', time: '6h ago', icon: Zap, color: 'yellow' },
  { id: '6', action: 'Completed task', detail: 'Review weekly metrics', time: '8h ago', icon: CheckCircle2, color: 'emerald' },
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
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  };
  
  const goalColorStyles = {
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  };
  
  const goalStyle = goalColorStyles[goal.color as keyof typeof goalColorStyles];
  
  return (
    <div className="group relative rounded-xl p-4 cursor-grab transition-all duration-200 bg-[#1e1e24] border border-[#2a2a32] hover:border-[#3a3a44] hover:bg-[#222229] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 text-zinc-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-zinc-100 font-medium leading-snug">{task.title}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 border ${priorityStyles[task.priority]}`}>
              {task.priority}
            </Badge>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${goalStyle.bg} ${goalStyle.border}`}>
              <GoalIcon className={`h-3 w-3 ${goalStyle.text}`} />
              <span className={`text-[10px] font-semibold ${goalStyle.text}`}>{goal.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-zinc-500 text-[11px]">
            <Clock className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks: columnTasks, color }: { title: string; tasks: Task[]; color: string }) {
  const colorStyles: Record<string, { dot: string; glow: string }> = {
    gray: { dot: 'bg-zinc-400', glow: '' },
    yellow: { dot: 'bg-amber-400', glow: 'shadow-[0_0_10px_rgba(251,191,36,0.6)]' },
    green: { dot: 'bg-emerald-400', glow: 'shadow-[0_0_10px_rgba(52,211,153,0.6)]' },
  };
  
  const style = colorStyles[color];
  
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot} ${style.glow}`} />
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          <span className="text-[11px] text-zinc-400 bg-[#1e1e24] px-2 py-0.5 rounded-md font-semibold border border-[#2a2a32]">{columnTasks.length}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-[#1e1e24]">
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

  const activityIconColors: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/25' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/25' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/25' },
    yellow: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/25' },
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0c]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-[#1e1e24] bg-[#121215] flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#1e1e24]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Mission Control</p>
              <p className="text-[11px] text-zinc-500">Owen&apos;s HQ</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-3 px-3">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    item.active 
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-[0_0_20px_-4px_rgba(139,92,246,0.3)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-[#1e1e24]'
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
        <div className="p-4 border-t border-[#1e1e24]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/25">
              OC
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Owen</p>
              <p className="text-[11px] text-zinc-500">Personal</p>
            </div>
            <Settings className="h-4 w-4 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24] bg-[#0e0e10]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-[#1e1e24] rounded-lg transition-all"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-[#2a2a32]" />
            <div>
              <h1 className="text-xl font-bold text-white">{greeting()}, Owen</h1>
              <p className="text-sm text-zinc-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search tasks..." 
                className="w-64 pl-9 bg-[#1e1e24] border-[#2a2a32] text-white placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>
            <Button variant="outline" size="icon" className="border-[#2a2a32] text-zinc-400 hover:text-white hover:bg-[#1e1e24] hover:border-[#3a3a44]">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/30 border-0">
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
              {[
                { label: 'This Week', value: '12', icon: Calendar, color: 'violet' },
                { label: 'In Progress', value: '3', icon: Clock, color: 'amber' },
                { label: 'Total Tasks', value: '47', icon: Target, color: 'emerald' },
                { label: 'Completion', value: '78%', icon: TrendingUp, color: 'blue', showProgress: true },
              ].map((stat) => {
                const Icon = stat.icon;
                const colorStyles: Record<string, { bg: string; icon: string; border: string }> = {
                  violet: { bg: 'bg-violet-500/15', icon: 'text-violet-400', border: 'border-violet-500/25' },
                  amber: { bg: 'bg-amber-500/15', icon: 'text-amber-400', border: 'border-amber-500/25' },
                  emerald: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', border: 'border-emerald-500/25' },
                  blue: { bg: 'bg-blue-500/15', icon: 'text-blue-400', border: 'border-blue-500/25' },
                };
                const style = colorStyles[stat.color];
                
                return (
                  <div key={stat.label} className="relative rounded-xl p-5 bg-[#1a1a1f] border border-[#2a2a32] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Top highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${style.icon}`} />
                      </div>
                    </div>
                    {stat.showProgress && (
                      <div className="relative mt-4 h-2.5 bg-[#0f0f12] rounded-full overflow-hidden border border-[#1e1e24]">
                        <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Goals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {goals.map((goal) => {
                const config = goalConfig[goal.key as keyof typeof goalConfig];
                const Icon = config.icon;
                const colorStyles: Record<string, { bg: string; text: string; progressFrom: string; progressTo: string; border: string; glow: string }> = {
                  violet: { bg: 'bg-violet-500/15', text: 'text-violet-400', progressFrom: 'from-violet-500', progressTo: 'to-purple-400', border: 'border-violet-500/25', glow: 'shadow-[0_0_16px_rgba(139,92,246,0.4)]' },
                  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', progressFrom: 'from-emerald-500', progressTo: 'to-teal-400', border: 'border-emerald-500/25', glow: 'shadow-[0_0_16px_rgba(52,211,153,0.4)]' },
                  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', progressFrom: 'from-orange-500', progressTo: 'to-amber-400', border: 'border-orange-500/25', glow: 'shadow-[0_0_16px_rgba(249,115,22,0.4)]' },
                };
                const style = colorStyles[config.color];
                
                return (
                  <div key={goal.key} className="relative rounded-xl p-5 bg-[#1a1a1f] border border-[#2a2a32] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Top highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="relative flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${style.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-white">{config.label}</p>
                          <span className={`text-sm font-bold ${style.text}`}>{goal.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-[#0f0f12] rounded-full overflow-hidden border border-[#1e1e24]">
                          <div 
                            className={`h-full bg-gradient-to-r ${style.progressFrom} ${style.progressTo} rounded-full transition-all duration-500 ${style.glow}`} 
                            style={{ width: `${goal.progress}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kanban */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Task Board</h2>
                <Badge variant="outline" className="bg-[#1a1a1f] text-zinc-400 border-[#2a2a32] text-[11px] font-semibold">
                  9 tasks
                </Badge>
              </div>
              
              <div className="flex gap-5">
                <KanbanColumn title="Backlog" tasks={tasks.backlog} color="gray" />
                <KanbanColumn title="In Progress" tasks={tasks.inProgress} color="yellow" />
                <KanbanColumn title="Done" tasks={tasks.done} color="green" />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="w-80 border-l border-[#1e1e24] p-4 overflow-auto bg-[#0a0a0c]">
            <div className="rounded-xl bg-[#1a1a1f] border border-[#2a2a32] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Top highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="p-4 border-b border-[#2a2a32] bg-[#161619]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Live Activity</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    Live
                  </Badge>
                </div>
              </div>
              <div className="p-2">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  const iconStyle = activityIconColors[activity.color];
                  return (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3 p-3 hover:bg-[#222228] rounded-xl transition-colors cursor-pointer">
                        <div className={`h-10 w-10 rounded-xl ${iconStyle.bg} border ${iconStyle.border} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-4 w-4 ${iconStyle.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-white font-semibold">{activity.action}</p>
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{activity.detail}</p>
                        </div>
                        <span className="text-[10px] text-zinc-600 shrink-0 font-semibold">{activity.time}</span>
                      </div>
                      {index < activities.length - 1 && <div className="h-px bg-[#2a2a32] mx-3" />}
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

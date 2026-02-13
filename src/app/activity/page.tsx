'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  MessageSquare, 
  Terminal, 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Calendar,
  Filter,
  ChevronRight,
  Bell,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'message' | 'tool_call' | 'tool_result' | 'session_start' | 'thinking';
  summary: string;
  sessionId: string;
  details?: string;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  nextRun: string | null;
  lastRun: string | null;
  lastStatus: string | null;
  lastDuration: number | null;
  deliveryMode: string;
  isOneTime: boolean;
}

type FilterType = 'all' | 'message' | 'tool_call' | 'session_start';

const typeIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-4 w-4" />,
  tool_call: <Terminal className="h-4 w-4" />,
  tool_result: <CheckCircle2 className="h-4 w-4" />,
  session_start: <Play className="h-4 w-4" />,
  thinking: <Zap className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  message: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  tool_call: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  tool_result: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  session_start: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  thinking: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30',
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function formatNextRun(timestamp: string | null): string {
  if (!timestamp) return 'Not scheduled';
  const now = new Date();
  const next = new Date(timestamp);
  const diffMs = next.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Overdue';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `In ${diffMins}m`;
  if (diffHours < 24) return `In ${diffHours}h`;
  if (diffDays < 7) return `In ${diffDays}d`;
  return next.toLocaleDateString();
}

function formatDuration(ms: number | null): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [activityRes, cronRes] = await Promise.all([
        fetch('/api/activity'),
        fetch('/api/cron'),
      ]);
      
      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivity(data.items || []);
      }
      
      if (cronRes.ok) {
        const data = await cronRes.json();
        setCronJobs(data.jobs || []);
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredActivity = filter === 'all' 
    ? activity 
    : activity.filter(item => item.type === filter);

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Zap className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Activity</h1>
            <p className="text-zinc-500">Real-time agent activity and scheduled jobs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Recent Activity
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
                >
                  <option value="all">All</option>
                  <option value="message">Messages</option>
                  <option value="tool_call">Tool Calls</option>
                  <option value="session_start">Sessions</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : filteredActivity.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  No activity found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActivity.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${typeColors[item.type] || typeColors.thinking}`}>
                        {typeIcons[item.type] || typeIcons.thinking}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-zinc-200 truncate">
                            {item.summary}
                          </span>
                        </div>
                        {item.details && (
                          <p className="text-xs text-zinc-500 truncate">
                            {item.details}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-600">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-500">
                            {item.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Cron Jobs Schedule */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-400" />
              Scheduled Jobs
              <Badge variant="outline" className="ml-2 border-zinc-700 text-zinc-400">
                {cronJobs.filter(j => j.enabled).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              ) : cronJobs.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  No scheduled jobs
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Job</TableHead>
                      <TableHead className="text-zinc-400">Schedule</TableHead>
                      <TableHead className="text-zinc-400">Next Run</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cronJobs.map((job) => (
                      <TableRow key={job.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.enabled ? (
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            ) : (
                              <Pause className="h-3 w-3 text-zinc-500" />
                            )}
                            <span className={`font-medium ${job.enabled ? 'text-zinc-200' : 'text-zinc-500'}`}>
                              {job.name}
                            </span>
                            {job.isOneTime && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-500/30 text-amber-400">
                                once
                              </Badge>
                            )}
                          </div>
                          {job.deliveryMode !== 'none' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Bell className="h-3 w-3 text-zinc-600" />
                              <span className="text-[10px] text-zinc-600">{job.deliveryMode}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {job.schedule}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-zinc-300">
                            {formatNextRun(job.nextRun)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.lastStatus === 'ok' ? (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                OK
                              </Badge>
                            ) : job.lastStatus === 'error' ? (
                              <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20">
                                <XCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-zinc-700 text-zinc-500">
                                —
                              </Badge>
                            )}
                            {job.lastDuration && (
                              <span className="text-[10px] text-zinc-600">
                                {formatDuration(job.lastDuration)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

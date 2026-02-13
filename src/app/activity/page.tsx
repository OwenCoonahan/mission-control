'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Bot,
  Settings,
  History
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'session' | 'task_completion'
  title: string
  description: string
  timestamp: string
  source?: string
}

interface CronJob {
  id: string
  expression: string
  description: string
  lastRun?: string
  nextRun?: string
  enabled: boolean
  command?: string
  scheduleDescription?: string
}

function formatRelativeTime(timestamp: string) {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return time.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function formatAbsoluteTime(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'session': return <Bot className="h-4 w-4 text-blue-400" />
    case 'task_completion': return <CheckCircle2 className="h-4 w-4 text-green-400" />
    default: return <Activity className="h-4 w-4 text-gray-400" />
  }
}

function getStatusIcon(enabled: boolean) {
  return enabled ? (
    <Play className="h-4 w-4 text-green-400" />
  ) : (
    <Pause className="h-4 w-4 text-red-400" />
  )
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [activityRes, cronRes] = await Promise.all([
        fetch('/api/activity'),
        fetch('/api/cron')
      ])

      const activityData = await activityRes.json()
      const cronData = await cronRes.json()

      setActivities(activityData.activities || [])
      setCronJobs(cronData.jobs || [])
    } catch (error) {
      console.error('Failed to fetch activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getNextRunStatus(nextRun: string | undefined) {
    if (!nextRun) return { text: 'Unknown', color: 'text-zinc-400' }
    
    const now = new Date()
    const next = new Date(nextRun)
    const diffMs = next.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)

    if (diffMinutes < 0) return { text: 'Overdue', color: 'text-red-400' }
    if (diffMinutes < 60) return { text: `${diffMinutes}m`, color: 'text-yellow-400' }
    if (diffHours < 24) return { text: `${diffHours}h`, color: 'text-blue-400' }
    
    return { 
      text: next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      color: 'text-zinc-400' 
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-zinc-800 rounded-lg"></div>
            <div className="h-96 bg-zinc-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Activity</h1>
        <p className="text-zinc-400">
          Monitor agent sessions and scheduled tasks
        </p>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800 mb-6">
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <History className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger 
            value="cron" 
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Cron Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Timeline */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Latest agent sessions and task completions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-medium">
                              {activity.title}
                            </h3>
                            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                              {activity.description}
                            </p>
                            {activity.source && (
                              <Badge variant="outline" className="mt-2 border-zinc-600 text-zinc-400 text-xs">
                                {activity.source}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end text-xs text-zinc-500">
                            <span>{formatRelativeTime(activity.timestamp)}</span>
                            <span className="mt-1">{formatAbsoluteTime(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline connector */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-6 mt-8 h-6 w-px bg-zinc-700" style={{ marginLeft: '20px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cron" className="space-y-6">
          {/* Cron Jobs Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  Active Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {cronJobs.filter(job => job.enabled).length}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  of {cronJobs.length} total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  Next Run
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const nextJob = cronJobs
                    .filter(job => job.enabled && job.nextRun)
                    .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())[0]
                  
                  const status = nextJob ? getNextRunStatus(nextJob.nextRun) : { text: 'None', color: 'text-zinc-400' }
                  
                  return (
                    <>
                      <div className={`text-2xl font-bold ${status.color}`}>
                        {status.text}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {nextJob ? nextJob.description.slice(0, 20) + '...' : 'No scheduled jobs'}
                      </p>
                    </>
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-300">
                  Last Run
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const recentJob = cronJobs
                    .filter(job => job.lastRun)
                    .sort((a, b) => new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime())[0]
                  
                  return (
                    <>
                      <div className="text-2xl font-bold text-white">
                        {recentJob ? formatRelativeTime(recentJob.lastRun!) : 'None'}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {recentJob ? recentJob.description.slice(0, 20) + '...' : 'No recent runs'}
                      </p>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Cron Jobs Table */}
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                Scheduled Jobs
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Automated tasks and their schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cronJobs.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled jobs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-700">
                      <TableHead className="text-zinc-300">Status</TableHead>
                      <TableHead className="text-zinc-300">Job</TableHead>
                      <TableHead className="text-zinc-300">Schedule</TableHead>
                      <TableHead className="text-zinc-300">Last Run</TableHead>
                      <TableHead className="text-zinc-300">Next Run</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cronJobs.map(job => {
                      const nextRunStatus = getNextRunStatus(job.nextRun)
                      return (
                        <TableRow key={job.id} className="border-zinc-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.enabled)}
                              <Badge 
                                variant="outline"
                                className={`text-xs ${job.enabled 
                                  ? 'border-green-600 text-green-400' 
                                  : 'border-red-600 text-red-400'
                                }`}
                              >
                                {job.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-white font-medium">
                                {job.id}
                              </div>
                              <div className="text-zinc-400 text-sm">
                                {job.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-white text-sm">
                                {job.scheduleDescription || job.expression}
                              </div>
                              <div className="text-zinc-500 text-xs font-mono">
                                {job.expression}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {job.lastRun ? formatRelativeTime(job.lastRun) : 'Never'}
                          </TableCell>
                          <TableCell className={nextRunStatus.color}>
                            {job.enabled && job.nextRun ? nextRunStatus.text : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
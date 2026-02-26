'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

interface CronJob {
  id: string
  name: string
  color: string
  schedule: {
    minute: number | null
    hour: number | null
    dayOfWeek: string | null
    tz: string
  } | null
  cronExpr: string | null
  isInterval: boolean
  intervalLabel: string
  nextRun: number | null
  lastRun: number | null
  lastStatus: string | null
  lastDuration: number | null
  consecutiveErrors: number
  lastError: string | null
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12
  const ampm = hour < 12 ? 'AM' : 'PM'
  return `${h}:${minute.toString().padStart(2, '0')} ${ampm}`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatRelativeTime(ms: number): string {
  const diff = ms - Date.now()
  const absDiff = Math.abs(diff)
  if (absDiff < 60000) return diff > 0 ? 'in <1m' : '<1m ago'
  if (absDiff < 3600000) { const m = Math.round(absDiff / 60000); return diff > 0 ? `in ${m}m` : `${m}m ago` }
  if (absDiff < 86400000) { const h = Math.round(absDiff / 3600000); return diff > 0 ? `in ${h}h` : `${h}h ago` }
  const d = Math.round(absDiff / 86400000); return diff > 0 ? `in ${d}d` : `${d}d ago`
}

function getWeekDates(): Date[] {
  const now = new Date()
  const day = now.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - day + i); return d
  })
}

function getJobsForDay(jobs: CronJob[], dayOfWeek: number): CronJob[] {
  return jobs.filter(job => {
    if (job.isInterval || !job.schedule) return false
    const dow = job.schedule.dayOfWeek
    if (dow === null || dow === '*') return true
    const parts = dow.split(',')
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (dayOfWeek >= start && dayOfWeek <= end) return true
      } else if (parseInt(part) === dayOfWeek) return true
    }
    return false
  })
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar').then(r => r.json()).then(data => setJobs(data.jobs || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const weekDates = getWeekDates()
  const today = new Date().getDay()
  const intervalJobs = jobs.filter(j => j.isInterval)
  const cronJobs = jobs.filter(j => !j.isInterval)
  const upcoming = [...jobs].filter(j => j.nextRun).sort((a, b) => (a.nextRun || 0) - (b.nextRun || 0)).slice(0, 8)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="h-48 bg-zinc-900 rounded-lg mb-6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="text-sm text-zinc-500 mt-1">Cron jobs and scheduled automations</p>
      </div>

      {intervalJobs.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-200 text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-zinc-500" /> Always Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {intervalJobs.map(job => (
                <div key={job.id} className="bg-zinc-800/50 border border-zinc-800 rounded-md px-3 py-2 flex items-center gap-2">
                  <span className="text-sm text-zinc-300">{job.name}</span>
                  <span className="text-xs text-zinc-600">{job.intervalLabel}</span>
                  {job.lastStatus === 'ok' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  {job.consecutiveErrors > 0 && <AlertCircle className="h-3 w-3 text-red-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-200 text-sm font-medium">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="grid grid-cols-7 gap-2 min-w-[600px] md:min-w-0">
            {weekDates.map((date, i) => {
              const isToday = i === today
              const dayJobs = getJobsForDay(cronJobs, i)
              return (
                <div key={i} className={`rounded-md p-2 min-h-[100px] md:min-h-[120px] ${isToday ? 'bg-zinc-800/60 border border-zinc-700' : 'bg-zinc-800/20'}`}>
                  <div className="text-center mb-2">
                    <div className={`text-[10px] md:text-xs ${isToday ? 'text-violet-400' : 'text-zinc-600'}`}>{SHORT_DAYS[i]}</div>
                    <div className={`text-sm md:text-base font-medium ${isToday ? 'text-white' : 'text-zinc-500'}`}>{date.getDate()}</div>
                  </div>
                  <div className="space-y-1">
                    {dayJobs.sort((a, b) => (a.schedule?.hour ?? 0) - (b.schedule?.hour ?? 0)).map(job => (
                      <div key={job.id} className="bg-zinc-800/60 rounded px-1 md:px-1.5 py-1 text-[9px] md:text-[10px] text-zinc-400 truncate" title={job.name}>
                        {job.schedule?.hour !== null && job.schedule?.minute !== null && (
                          <span className="text-zinc-600">{formatTime(job.schedule!.hour!, job.schedule!.minute!).split(' ')[0]} </span>
                        )}
                        {job.name.length > 14 ? job.name.slice(0, 14) + '...' : job.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-200 text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-500" /> Next Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {upcoming.map(job => (
              <div key={job.id} className="flex items-center gap-3 py-2.5 px-3 bg-zinc-800/30 rounded-md">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-200">{job.name}</div>
                  <div className="text-xs text-zinc-600">
                    {job.cronExpr && `cron: ${job.cronExpr}`}
                    {job.isInterval && job.intervalLabel}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-zinc-400">{job.nextRun ? formatRelativeTime(job.nextRun) : '—'}</div>
                  <div className="text-xs text-zinc-600 flex items-center gap-1 justify-end">
                    {job.lastStatus === 'ok' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    {job.consecutiveErrors > 0 && <span className="text-red-400 flex items-center gap-0.5"><AlertCircle className="h-3 w-3" />{job.consecutiveErrors} err</span>}
                    {job.lastDuration && <span>{formatDuration(job.lastDuration)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Zap, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

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

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  zinc: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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
  const now = Date.now()
  const diff = ms - now
  const absDiff = Math.abs(diff)
  
  if (absDiff < 60000) return diff > 0 ? 'in <1m' : '<1m ago'
  if (absDiff < 3600000) {
    const m = Math.round(absDiff / 60000)
    return diff > 0 ? `in ${m}m` : `${m}m ago`
  }
  if (absDiff < 86400000) {
    const h = Math.round(absDiff / 3600000)
    return diff > 0 ? `in ${h}h` : `${h}h ago`
  }
  const d = Math.round(absDiff / 86400000)
  return diff > 0 ? `in ${d}d` : `${d}d ago`
}

function getWeekDates(): Date[] {
  const now = new Date()
  const day = now.getDay()
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - day + i)
    dates.push(d)
  }
  return dates
}

function getJobsForDay(jobs: CronJob[], dayOfWeek: number): CronJob[] {
  return jobs.filter(job => {
    if (job.isInterval || !job.schedule) return false
    const dow = job.schedule.dayOfWeek
    if (dow === null || dow === '*') return true // every day
    // Parse dow — could be "0", "0,6", "1-5", etc.
    const parts = dow.split(',')
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (dayOfWeek >= start && dayOfWeek <= end) return true
      } else if (parseInt(part) === dayOfWeek) {
        return true
      }
    }
    return false
  })
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/calendar')
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error('Failed to fetch calendar:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const weekDates = getWeekDates()
  const today = new Date().getDay()
  const intervalJobs = jobs.filter(j => j.isInterval)
  const cronJobs = jobs.filter(j => !j.isInterval)
  const upcoming = [...jobs]
    .filter(j => j.nextRun)
    .sort((a, b) => (a.nextRun || 0) - (b.nextRun || 0))
    .slice(0, 8)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-8"></div>
          <div className="h-64 bg-zinc-800 rounded-xl mb-6"></div>
          <div className="h-48 bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-violet-400" />
          Calendar
        </h1>
        <p className="text-zinc-400">Cron jobs and scheduled automations</p>
      </div>

      {/* Always Running */}
      {intervalJobs.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-violet-400" />
              Always Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {intervalJobs.map(job => {
                const c = COLOR_MAP[job.color] || COLOR_MAP.zinc
                return (
                  <div key={job.id} className={`${c.bg} border ${c.border} rounded-lg px-3 py-2 flex items-center gap-2`}>
                    <Zap className={`h-4 w-4 ${c.text}`} />
                    <span className="text-sm text-zinc-200">{job.name}</span>
                    <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                      {job.intervalLabel}
                    </Badge>
                    {job.lastStatus === 'ok' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {job.consecutiveErrors > 0 && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly View */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, i) => {
              const isToday = i === today
              const dayJobs = getJobsForDay(cronJobs, i)
              
              return (
                <div key={i} className={`rounded-lg p-2 min-h-[140px] ${
                  isToday ? 'bg-violet-500/5 border border-violet-500/20' : 'bg-zinc-800/50'
                }`}>
                  <div className="text-center mb-2">
                    <div className={`text-xs font-medium ${isToday ? 'text-violet-400' : 'text-zinc-500'}`}>
                      {SHORT_DAYS[i]}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-zinc-400'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayJobs
                      .sort((a, b) => (a.schedule?.hour ?? 0) - (b.schedule?.hour ?? 0))
                      .map(job => {
                        const c = COLOR_MAP[job.color] || COLOR_MAP.zinc
                        return (
                          <div key={job.id} className={`${c.bg} rounded px-1.5 py-1 text-[10px] ${c.text} truncate`} title={job.name}>
                            {job.schedule?.hour !== null && job.schedule?.minute !== null && (
                              <span className="opacity-70">
                                {formatTime(job.schedule!.hour!, job.schedule!.minute!).split(' ')[0]}{' '}
                              </span>
                            )}
                            {job.name.length > 14 ? job.name.slice(0, 14) + '…' : job.name}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Up */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-400" />
            Next Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcoming.map(job => {
              const c = COLOR_MAP[job.color] || COLOR_MAP.zinc
              return (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${c.text.replace('text-', 'bg-')}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200">{job.name}</div>
                    <div className="text-xs text-zinc-500">
                      {job.cronExpr && `cron: ${job.cronExpr}`}
                      {job.isInterval && job.intervalLabel}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-zinc-300">
                      {job.nextRun ? formatRelativeTime(job.nextRun) : '—'}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                      {job.lastStatus === 'ok' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                      {job.consecutiveErrors > 0 && (
                        <span className="text-red-400 flex items-center gap-0.5">
                          <AlertCircle className="h-3 w-3" />
                          {job.consecutiveErrors} errors
                        </span>
                      )}
                      {job.lastDuration && <span>{formatDuration(job.lastDuration)}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

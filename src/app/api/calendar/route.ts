import { NextResponse } from 'next/server'
import fs from 'fs/promises'

const JOBS_FILE = '/Users/castle-owencoonahan/.openclaw/cron/jobs.json'

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: {
    kind: 'cron' | 'every'
    expr?: string
    tz?: string
    everyMs?: number
    anchorMs?: number
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    lastDurationMs?: number
    consecutiveErrors?: number
    lastError?: string
  }
  delivery?: {
    mode: string
    channel?: string
  }
}

function getJobColor(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('morning') || lower.includes('planning')) return 'yellow'
  if (lower.includes('evening') || lower.includes('night')) return 'indigo'
  if (lower.includes('research') || lower.includes('news') || lower.includes('digest')) return 'green'
  if (lower.includes('reminder') || lower.includes('nudge') || lower.includes('gratitude') || lower.includes('breathwork')) return 'blue'
  if (lower.includes('health') || lower.includes('cpu') || lower.includes('quality')) return 'red'
  if (lower.includes('review') || lower.includes('weekly')) return 'purple'
  if (lower.includes('event')) return 'orange'
  return 'zinc'
}

function parseCronToSchedule(expr: string, tz?: string) {
  // Parse "min hour dom month dow"
  const parts = expr.split(' ')
  if (parts.length !== 5) return null
  
  const [minute, hour, , , dayOfWeek] = parts
  
  return {
    minute: minute === '*' ? null : parseInt(minute),
    hour: hour === '*' ? null : parseInt(hour),
    dayOfWeek: dayOfWeek === '*' ? null : dayOfWeek,
    tz: tz || 'America/New_York'
  }
}

export async function GET() {
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf-8')
    const data = JSON.parse(raw)
    const jobs: CronJob[] = data.jobs || []

    const enriched = jobs
      .filter(j => j.enabled)
      .map(job => {
        const color = getJobColor(job.name)
        let schedule = null
        let isInterval = false
        let intervalLabel = ''

        if (job.schedule.kind === 'cron' && job.schedule.expr) {
          schedule = parseCronToSchedule(job.schedule.expr, job.schedule.tz)
        } else if (job.schedule.kind === 'every' && job.schedule.everyMs) {
          isInterval = true
          const hours = job.schedule.everyMs / 3600000
          if (hours >= 1) {
            intervalLabel = `Every ${hours}h`
          } else {
            intervalLabel = `Every ${job.schedule.everyMs / 60000}m`
          }
        }

        return {
          id: job.id,
          name: job.name,
          color,
          schedule,
          cronExpr: job.schedule.kind === 'cron' ? job.schedule.expr : null,
          isInterval,
          intervalLabel,
          nextRun: job.state?.nextRunAtMs || null,
          lastRun: job.state?.lastRunAtMs || null,
          lastStatus: job.state?.lastStatus || null,
          lastDuration: job.state?.lastDurationMs || null,
          consecutiveErrors: job.state?.consecutiveErrors || 0,
          lastError: job.state?.lastError || null,
        }
      })

    return NextResponse.json({ jobs: enriched })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: 'Failed to read cron jobs' }, { status: 500 })
  }
}

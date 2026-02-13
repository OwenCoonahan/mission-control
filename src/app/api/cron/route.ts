import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CRON_FILE = '/Users/castle-owencoonahan/.openclaw/cron/jobs.json'

interface CronJob {
  id: string
  expression: string
  description: string
  lastRun?: string
  nextRun?: string
  enabled: boolean
  command?: string
}

async function getCronJobs(): Promise<CronJob[]> {
  try {
    // Check if cron file exists
    try {
      await fs.access(CRON_FILE)
    } catch {
      return []
    }

    const data = await fs.readFile(CRON_FILE, 'utf-8')
    const cronData = JSON.parse(data)
    
    // Parse cron jobs from OpenClaw format
    if (cronData.jobs && Array.isArray(cronData.jobs)) {
      return cronData.jobs.map((job: any) => ({
        id: job.id || job.name || 'unknown',
        expression: job.schedule || job.cron || '0 */1 * * *',
        description: job.description || job.task || 'Scheduled task',
        lastRun: job.lastRun,
        nextRun: job.nextRun,
        enabled: job.enabled !== false,
        command: job.command
      }))
    }

    return []
  } catch (error) {
    console.error('Error reading cron jobs:', error)
    // Return mock data if we can't read the real cron file
    return [
      {
        id: 'heartbeat',
        expression: '*/30 * * * *',
        description: 'Heartbeat check - monitor for updates',
        lastRun: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        nextRun: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
        enabled: true
      },
      {
        id: 'daily-review',
        expression: '0 18 * * *',
        description: 'Daily progress review and planning',
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        nextRun: new Date().toISOString().split('T')[0] + 'T18:00:00.000Z',
        enabled: true
      },
      {
        id: 'morning-briefing',
        expression: '0 8 * * *',
        description: 'Morning briefing with agenda',
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
        enabled: true
      }
    ]
  }
}

function parseCronExpression(expression: string): string {
  // Basic cron expression parser for display
  const parts = expression.split(' ')
  if (parts.length < 5) return 'Invalid expression'
  
  const [minute, hour, day, month, dayOfWeek] = parts
  
  if (minute.startsWith('*') && hour === '*') {
    const interval = minute.includes('/') ? minute.split('/')[1] : '1'
    return `Every ${interval} minute${interval !== '1' ? 's' : ''}`
  }
  
  if (minute === '0' && hour !== '*') {
    if (hour.includes('/')) {
      const interval = hour.split('/')[1]
      return `Every ${interval} hour${interval !== '1' ? 's' : ''}`
    }
    return `Daily at ${hour}:00`
  }
  
  return expression
}

export async function GET() {
  try {
    const jobs = await getCronJobs()
    
    // Add human-readable schedule descriptions
    const formattedJobs = jobs.map(job => ({
      ...job,
      scheduleDescription: parseCronExpression(job.expression)
    }))
    
    return NextResponse.json({ jobs: formattedJobs })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cron jobs' },
      { status: 500 }
    )
  }
}
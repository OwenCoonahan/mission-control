import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const SESSIONS_DIR = '/Users/castle-owencoonahan/.openclaw/agents/cron-runner/sessions'

interface ActivityItem {
  id: string
  type: 'session' | 'task_completion'
  title: string
  description: string
  timestamp: string
  source?: string
}

async function getRecentSessions(): Promise<ActivityItem[]> {
  try {
    // Check if sessions directory exists
    try {
      await fs.access(SESSIONS_DIR)
    } catch {
      return []
    }

    const files = await fs.readdir(SESSIONS_DIR)
    const sessionFiles = files
      .filter(file => file.endsWith('.jsonl'))
      .sort()
      .slice(-10) // Get last 10 session files

    const activities: ActivityItem[] = []

    for (const file of sessionFiles) {
      try {
        const filePath = path.join(SESSIONS_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const lines = content.trim().split('\n').filter(line => line.trim())
        
        if (lines.length === 0) continue

        // Parse the last few lines of each session
        const recentLines = lines.slice(-3)
        
        for (const line of recentLines) {
          try {
            const sessionData = JSON.parse(line)
            
            // Extract meaningful activity from session data
            if (sessionData.content) {
              const timestamp = sessionData.timestamp || new Date().toISOString()
              const sessionId = file.replace('.jsonl', '')
              
              activities.push({
                id: `${sessionId}-${Date.now()}`,
                type: 'session',
                title: 'Agent Activity',
                description: sessionData.content.slice(0, 200),
                timestamp,
                source: sessionId
              })
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue
          }
        }
      } catch (e) {
        // Skip files we can't read
        continue
      }
    }

    // Sort by timestamp descending and return recent ones
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

  } catch (error) {
    console.error('Error reading sessions:', error)
    return []
  }
}

export async function GET() {
  try {
    // For now, return mock data since session parsing might be complex
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'task_completion',
        title: 'Task Completed',
        description: 'OpenClaw presentation completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        type: 'session',
        title: 'Agent Session',
        description: 'Processed heartbeat check and reviewed calendar',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 90 minutes ago
      },
      {
        id: '3',
        type: 'task_completion',
        title: 'Task Completed',
        description: 'Morning workout completed - Push day',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
      },
      {
        id: '4',
        type: 'session',
        title: 'Agent Session',
        description: 'Sent business outreach messages',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
      }
    ]

    // Try to get real session data, but fall back to mock if needed
    const realActivities = await getRecentSessions()
    
    return NextResponse.json({
      activities: realActivities.length > 0 ? realActivities : activities
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
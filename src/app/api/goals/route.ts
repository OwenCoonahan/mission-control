import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const GOALS_FILE = path.join(process.cwd(), 'data/goals.json')

export interface Goal {
  id: 'mind' | 'business' | 'body'
  title: string
  emoji: string
  description: string
  progress: number
  color: string
  updatedAt?: string
}

interface GoalsData {
  goals: Goal[]
}

async function readGoals(): Promise<GoalsData> {
  try {
    const data = await fs.readFile(GOALS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Return default goals if file doesn't exist
    return {
      goals: [
        {
          id: 'mind',
          title: 'Calm Mind',
          emoji: '🧘',
          description: 'Less caffeine, deep breathing, deliberate time',
          progress: 0,
          color: 'violet'
        },
        {
          id: 'business',
          title: 'Grow Business',
          emoji: '📈',
          description: 'Do what moves the needle. Execute the playbook.',
          progress: 0,
          color: 'emerald'
        },
        {
          id: 'body',
          title: 'Greek God Body',
          emoji: '💪',
          description: 'Eat and workout with discipline',
          progress: 0,
          color: 'orange'
        }
      ]
    }
  }
}

async function writeGoals(data: GoalsData): Promise<void> {
  await fs.writeFile(GOALS_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const data = await readGoals()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read goals' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, progress } = body

    if (!id || progress === undefined) {
      return NextResponse.json(
        { error: 'Goal ID and progress are required' },
        { status: 400 }
      )
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
        { status: 400 }
      )
    }

    const data = await readGoals()
    const goalIndex = data.goals.findIndex(goal => goal.id === id)
    
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    data.goals[goalIndex] = {
      ...data.goals[goalIndex],
      progress,
      updatedAt: new Date().toISOString()
    }

    await writeGoals(data)
    return NextResponse.json(data.goals[goalIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}
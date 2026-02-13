import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json')

export interface Task {
  id: string
  title: string
  status: 'backlog' | 'today' | 'in-progress' | 'done'
  priority: 'frog' | 'high' | 'medium' | 'low'
  goal: 'mind' | 'business' | 'body' | null
  dueDate: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

interface TasksData {
  tasks: Task[]
  streak: number
}

async function readTasks(): Promise<TasksData> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { tasks: [], streak: 0 }
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const data = await readTasks()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, goal, priority, dueDate, status } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const data = await readTasks()
    const now = new Date().toISOString()
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      status: status || 'backlog',
      priority: priority || 'medium',
      goal: goal || null,
      dueDate: dueDate || null,
      completed: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    }

    data.tasks.push(newTask)
    await writeTasks(data)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
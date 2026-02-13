import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json')

interface Task {
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
    return { tasks: [], streak: 0 }
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2))
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await readTasks()
    
    const taskIndex = data.tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const updatedTask = {
      ...data.tasks[taskIndex],
      ...body,
      updatedAt: now
    }

    // Handle completion status
    if (body.status === 'done' && !data.tasks[taskIndex].completed) {
      updatedTask.completed = true
      updatedTask.completedAt = now
    } else if (body.status !== 'done' && data.tasks[taskIndex].completed) {
      updatedTask.completed = false
      updatedTask.completedAt = null
    }

    data.tasks[taskIndex] = updatedTask
    await writeTasks(data)

    return NextResponse.json(updatedTask)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readTasks()
    
    const taskIndex = data.tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    data.tasks.splice(taskIndex, 1)
    await writeTasks(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
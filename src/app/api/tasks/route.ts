import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'today' | 'in-progress' | 'done';
  priority: 'frog' | 'high' | 'medium' | 'low';
  goal: 'mind' | 'business' | 'body' | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TasksData {
  tasks: Task[];
  streak?: number;
}

async function readTasks(): Promise<TasksData> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return { tasks: [], streak: 0 };
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = await readTasks();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return NextResponse.json({ tasks: [], streak: 0 }, { status: 500 });
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readTasks();
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: body.title,
      status: body.status || 'backlog',
      priority: body.priority || 'medium',
      goal: body.goal || null,
      dueDate: body.dueDate || null,
      completed: body.status === 'done',
      completedAt: body.status === 'done' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    await writeTasks(data);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

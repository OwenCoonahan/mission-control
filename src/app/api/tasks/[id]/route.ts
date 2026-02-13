import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'today' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  goal: 'mind' | 'business' | 'body' | null;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface TasksData {
  tasks: Task[];
}

async function readTasks(): Promise<TasksData> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return { tasks: [] };
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readTasks();
    const task = data.tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await readTasks();
    
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const existingTask = data.tasks[taskIndex];
    const updatedTask: Task = {
      ...existingTask,
      title: body.title ?? existingTask.title,
      status: body.status ?? existingTask.status,
      priority: body.priority ?? existingTask.priority,
      goal: body.goal !== undefined ? body.goal : existingTask.goal,
      dueDate: body.dueDate !== undefined ? body.dueDate : existingTask.dueDate,
      completedAt: body.status === 'done' && existingTask.status !== 'done' 
        ? new Date().toISOString() 
        : (body.status !== 'done' ? null : existingTask.completedAt),
    };
    
    data.tasks[taskIndex] = updatedTask;
    await writeTasks(data);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readTasks();
    
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const deletedTask = data.tasks.splice(taskIndex, 1)[0];
    await writeTasks(data);
    
    return NextResponse.json({ message: 'Task deleted', task: deletedTask });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

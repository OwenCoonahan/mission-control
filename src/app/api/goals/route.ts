import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'goals.json');

interface Goal {
  id: 'mind' | 'business' | 'body';
  title: string;
  progress: number;
  emoji?: string;
  description?: string;
  target?: string;
  color?: string;
}

interface GoalsData {
  goals: Goal[];
}

function readGoals(): GoalsData {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { goals: [] };
  }
}

function writeGoals(data: GoalsData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET /api/goals - Get all goals
export async function GET() {
  try {
    const data = readGoals();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading goals:', error);
    return NextResponse.json({ goals: [] }, { status: 500 });
  }
}

// PUT /api/goals - Update a goal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }
    
    const data = readGoals();
    const goalIndex = data.goals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    data.goals[goalIndex] = {
      ...data.goals[goalIndex],
      ...updates,
    };
    
    writeGoals(data);
    return NextResponse.json(data.goals[goalIndex]);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

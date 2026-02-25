import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data/content.json')

export interface ContentItem {
  id: string
  title: string
  platform: string
  stage: 'ideas' | 'scripting' | 'ready' | 'posting' | 'published'
  hook: string
  tool: string | null
  createdAt: string
}

interface ContentData {
  content: ContentItem[]
}

async function readContent(): Promise<ContentData> {
  try {
    const data = await fs.readFile(CONTENT_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    // Support both { content: [...] } and { items: [...] } formats
    const items = parsed.content || parsed.items || []
    return { content: items }
  } catch {
    return { content: [] }
  }
}

async function writeContent(data: ContentData): Promise<void> {
  await fs.writeFile(CONTENT_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const data = await readContent()
    // Return as { items: [...] } for frontend compatibility
    return NextResponse.json({ items: data.content })
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, platform, stage, hook, tool } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const data = await readContent()
    const newItem: ContentItem = {
      id: `c${Date.now()}`,
      title,
      platform: platform || 'linkedin',
      stage: stage || 'ideas',
      hook: hook || '',
      tool: tool || null,
      createdAt: new Date().toISOString().split('T')[0],
    }

    data.content.push(newItem)
    await writeContent(data)

    return NextResponse.json(newItem, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data = await readContent()
    const idx = data.content.findIndex(item => item.id === id)
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Map old status names to new stage names
    const stageMap: Record<string, string> = {
      thumbnail: 'ready',
      filming: 'posting',
    }
    if (updates.status) {
      updates.stage = stageMap[updates.status] || updates.status
      delete updates.status
    }

    data.content[idx] = { ...data.content[idx], ...updates }
    await writeContent(data)
    return NextResponse.json(data.content[idx])
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data = await readContent()
    data.content = data.content.filter(item => item.id !== id)
    await writeContent(data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

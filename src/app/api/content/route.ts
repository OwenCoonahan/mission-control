import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data/content.json')

export interface ContentItem {
  id: string
  title: string
  description: string
  status: 'ideas' | 'scripting' | 'thumbnail' | 'filming' | 'editing' | 'published'
  platform: 'youtube' | 'twitter' | 'linkedin'
  assignedTo: 'Owen' | 'Henry'
  createdAt: string
  updatedAt: string
}

interface ContentData {
  items: ContentItem[]
}

async function readContent(): Promise<ContentData> {
  try {
    const data = await fs.readFile(CONTENT_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { items: [] }
  }
}

async function writeContent(data: ContentData): Promise<void> {
  await fs.writeFile(CONTENT_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const data = await readContent()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, platform, assignedTo, status } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const data = await readContent()
    const now = new Date().toISOString()

    const newItem: ContentItem = {
      id: `content-${Date.now()}`,
      title,
      description: description || '',
      status: status || 'ideas',
      platform: platform || 'youtube',
      assignedTo: assignedTo || 'Owen',
      createdAt: now,
      updatedAt: now,
    }

    data.items.push(newItem)
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
    const idx = data.items.findIndex(item => item.id === id)
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    data.items[idx] = {
      ...data.items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await writeContent(data)
    return NextResponse.json(data.items[idx])
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
    data.items = data.items.filter(item => item.id !== id)
    await writeContent(data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}

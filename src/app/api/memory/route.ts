import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const MEMORY_DIR = '/Users/castle-owencoonahan/.openclaw/workspace/memory'
const MEMORY_FILE = '/Users/castle-owencoonahan/.openclaw/workspace/MEMORY.md'

interface MemoryFile {
  name: string
  path: string
  date: string | null
  size: number
  wordCount: number
  isLongTerm: boolean
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')
  const search = searchParams.get('search')

  try {
    // If requesting a specific file
    if (file) {
      let filePath: string
      if (file === 'MEMORY.md') {
        filePath = MEMORY_FILE
      } else {
        filePath = path.join(MEMORY_DIR, file)
      }
      
      // Security check
      const resolved = path.resolve(filePath)
      if (!resolved.startsWith('/Users/castle-owencoonahan/.openclaw/workspace')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      const content = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ content, name: file })
    }

    // List all memory files
    const entries = await fs.readdir(MEMORY_DIR)
    const files: MemoryFile[] = []

    // Add MEMORY.md first
    try {
      const memStat = await fs.stat(MEMORY_FILE)
      const memContent = await fs.readFile(MEMORY_FILE, 'utf-8')
      files.push({
        name: 'MEMORY.md',
        path: 'MEMORY.md',
        date: null,
        size: memStat.size,
        wordCount: memContent.split(/\s+/).filter(Boolean).length,
        isLongTerm: true
      })
    } catch { /* MEMORY.md might not exist */ }

    // Add daily files
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue
      const filePath = path.join(MEMORY_DIR, entry)
      const stat = await fs.stat(filePath)
      if (!stat.isFile()) continue
      
      const content = await fs.readFile(filePath, 'utf-8')
      const dateMatch = entry.match(/^(\d{4}-\d{2}-\d{2})\.md$/)
      
      files.push({
        name: entry,
        path: entry,
        date: dateMatch ? dateMatch[1] : null,
        size: stat.size,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        isLongTerm: false
      })
    }

    // Sort: MEMORY.md first, then by date descending
    files.sort((a, b) => {
      if (a.isLongTerm) return -1
      if (b.isLongTerm) return 1
      if (a.date && b.date) return b.date.localeCompare(a.date)
      return a.name.localeCompare(b.name)
    })

    // Search if query provided
    if (search) {
      const query = search.toLowerCase()
      const results: (MemoryFile & { snippet: string })[] = []
      
      for (const f of files) {
        const filePath = f.isLongTerm ? MEMORY_FILE : path.join(MEMORY_DIR, f.name)
        const content = await fs.readFile(filePath, 'utf-8')
        const lower = content.toLowerCase()
        const idx = lower.indexOf(query)
        if (idx !== -1) {
          const start = Math.max(0, idx - 60)
          const end = Math.min(content.length, idx + query.length + 60)
          const snippet = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')
          results.push({ ...f, snippet })
        }
      }
      
      return NextResponse.json({ files: results, total: results.length })
    }

    return NextResponse.json({ files, total: files.length })
  } catch (error) {
    console.error('Memory API error:', error)
    return NextResponse.json({ error: 'Failed to read memory files' }, { status: 500 })
  }
}

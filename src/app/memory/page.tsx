'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Pin, ChevronDown, ChevronRight } from 'lucide-react'

interface MemoryFile {
  name: string
  path: string
  date: string | null
  size: number
  wordCount: number
  isLongTerm: boolean
  snippet?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  return `${(bytes / 1024).toFixed(1)}KB`
}

function getMonthKey(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set())

  const fetchFiles = useCallback(async (query?: string) => {
    try {
      const url = query ? `/api/memory?search=${encodeURIComponent(query)}` : '/api/memory'
      const res = await fetch(url)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to fetch memory files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  useEffect(() => {
    const timer = setTimeout(() => { fetchFiles(search || undefined) }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchFiles])

  async function loadFile(name: string) {
    setContentLoading(true)
    setSelectedFile(name)
    try {
      const res = await fetch(`/api/memory?file=${encodeURIComponent(name)}`)
      const data = await res.json()
      setContent(data.content || '')
    } catch (error) {
      console.error('Failed to load file:', error)
      setContent('Failed to load file.')
    } finally {
      setContentLoading(false)
    }
  }

  function toggleMonth(month: string) {
    setCollapsedMonths(prev => {
      const next = new Set(prev)
      if (next.has(month)) next.delete(month)
      else next.add(month)
      return next
    })
  }

  const longTermFiles = files.filter(f => f.isLongTerm)
  const nonDateFiles = files.filter(f => !f.isLongTerm && !f.date)
  const dateFiles = files.filter(f => f.date)
  const grouped: Record<string, MemoryFile[]> = {}
  for (const f of dateFiles) {
    const key = getMonthKey(f.date!)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(f)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="flex gap-6">
            <div className="w-72 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-zinc-900 rounded"></div>)}</div>
            <div className="flex-1 h-64 bg-zinc-900 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Memory</h1>
        <p className="text-sm text-zinc-500 mt-1">Daily journals and long-term memory</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-180px)]">
        <div className="w-full md:w-72 flex-shrink-0 flex flex-col max-h-[50vh] md:max-h-none">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 h-8 text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {longTermFiles.map(f => (
              <button
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  selectedFile === f.name ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <Pin className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">Long-Term Memory</div>
                  <div className="text-xs text-zinc-600">{f.wordCount} words</div>
                </div>
              </button>
            ))}

            {nonDateFiles.map(f => (
              <button
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  selectedFile === f.name ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.name}</div>
                  <div className="text-xs text-zinc-600">{f.wordCount} words</div>
                </div>
              </button>
            ))}

            {Object.entries(grouped).map(([month, monthFiles]) => (
              <div key={month}>
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-zinc-600 uppercase tracking-wider hover:text-zinc-400 transition-colors"
                >
                  {collapsedMonths.has(month) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {month}
                  <span className="ml-auto text-zinc-700">{monthFiles.length}</span>
                </button>
                {!collapsedMonths.has(month) && monthFiles.map(f => (
                  <button
                    key={f.name}
                    onClick={() => loadFile(f.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                      selectedFile === f.name ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{formatDate(f.date!)}</div>
                      <div className="text-xs text-zinc-600">{f.wordCount} words</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 overflow-hidden">
          {selectedFile ? (
            <>
              <CardHeader className="border-b border-zinc-800 py-3">
                <CardTitle className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  {selectedFile}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto h-[calc(100%-52px)]">
                {contentLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-zinc-800 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>)}
                  </div>
                ) : (
                  <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <p className="text-sm">Select a memory file to view</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

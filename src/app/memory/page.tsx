'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Brain, Search, FileText, Pin, ChevronDown, ChevronRight } from 'lucide-react'

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
      const url = query 
        ? `/api/memory?search=${encodeURIComponent(query)}`
        : '/api/memory'
      const res = await fetch(url)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to fetch memory files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles(search || undefined)
    }, 300)
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

  // Group files by month
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
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-8"></div>
          <div className="flex gap-6">
            <div className="w-80 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-800 rounded"></div>
              ))}
            </div>
            <div className="flex-1 h-96 bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-violet-400" />
          Memory
        </h1>
        <p className="text-zinc-400">Daily journals and long-term memory</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left sidebar - file list */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {/* Long-term memory */}
            {longTermFiles.map(f => (
              <button
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedFile === f.name
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Pin className="h-4 w-4 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">Long-Term Memory</div>
                  <div className="text-xs text-zinc-500">{f.wordCount} words · {formatFileSize(f.size)}</div>
                </div>
                {f.snippet && (
                  <div className="text-xs text-zinc-500 truncate max-w-[120px]">{f.snippet}</div>
                )}
              </button>
            ))}

            {/* Non-date files */}
            {nonDateFiles.map(f => (
              <button
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedFile === f.name
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.name}</div>
                  <div className="text-xs text-zinc-500">{f.wordCount} words · {formatFileSize(f.size)}</div>
                </div>
              </button>
            ))}

            {/* Grouped by month */}
            {Object.entries(grouped).map(([month, monthFiles]) => (
              <div key={month}>
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors"
                >
                  {collapsedMonths.has(month) 
                    ? <ChevronRight className="h-3 w-3" />
                    : <ChevronDown className="h-3 w-3" />
                  }
                  {month}
                  <Badge variant="secondary" className="ml-auto bg-zinc-800 text-zinc-500 text-[10px]">
                    {monthFiles.length}
                  </Badge>
                </button>

                {!collapsedMonths.has(month) && monthFiles.map(f => (
                  <button
                    key={f.name}
                    onClick={() => loadFile(f.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedFile === f.name
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <FileText className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{formatDate(f.date!)}</div>
                      <div className="text-xs text-zinc-500">{f.wordCount} words · {formatFileSize(f.size)}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card className="flex-1 bg-zinc-900 border-zinc-800 overflow-hidden">
          {selectedFile ? (
            <>
              <CardHeader className="border-b border-zinc-800 py-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-400" />
                  {selectedFile}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto h-[calc(100%-60px)]">
                {contentLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-4 bg-zinc-800 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {content}
                  </pre>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a memory file to view</p>
                <p className="text-sm mt-1">Browse daily journals or search across all memories</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Film, Plus, Trash2, Twitter, Linkedin } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  platform: string
  stage: string
  hook: string
  tool: string | null
  createdAt: string
  // Legacy fields
  description?: string
  status?: string
}

const COLUMNS = [
  { id: 'ideas', title: '💡 Ideas', color: 'border-yellow-500/30', headerBg: 'bg-yellow-500/10', headerText: 'text-yellow-400' },
  { id: 'scripting', title: '✍️ Scripting', color: 'border-blue-500/30', headerBg: 'bg-blue-500/10', headerText: 'text-blue-400' },
  { id: 'ready', title: '✅ Ready', color: 'border-purple-500/30', headerBg: 'bg-purple-500/10', headerText: 'text-purple-400' },
  { id: 'posting', title: '📤 Posting', color: 'border-orange-500/30', headerBg: 'bg-orange-500/10', headerText: 'text-orange-400' },
  { id: 'published', title: '🚀 Published', color: 'border-green-500/30', headerBg: 'bg-green-500/10', headerText: 'text-green-400' },
] as const

const PLATFORM_ICONS: Record<string, typeof Linkedin> = {
  twitter: Twitter,
  linkedin: Linkedin,
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'bg-blue-400/20 text-blue-400',
  linkedin: 'bg-blue-600/20 text-blue-300',
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    hook: '',
    platform: 'linkedin',
    stage: 'ideas',
  })

  useEffect(() => { fetchContent() }, [])

  async function fetchContent() {
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
      // Normalize: map status->stage for legacy items
      const normalized = (data.items || []).map((item: ContentItem) => ({
        ...item,
        stage: item.stage || item.status || 'ideas',
        platform: (item.platform || 'linkedin').toLowerCase(),
      }))
      setItems(normalized)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createItem() {
    if (!newItem.title.trim()) return
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        await fetchContent()
        setNewItem({ title: '', hook: '', platform: 'linkedin', stage: 'ideas' })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create content:', error)
    }
  }

  async function updateStage(id: string, stage: string) {
    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage }),
      })
      await fetchContent()
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }

  async function deleteItem(id: string) {
    try {
      await fetch(`/api/content?id=${id}`, { method: 'DELETE' })
      await fetchContent()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  function getColumnItems(stage: string) {
    return items.filter(item => item.stage === stage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Film className="h-8 w-8 text-violet-400" />
            Content Pipeline
          </h1>
          <p className="text-zinc-400">Track content from idea to published</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">New Content</DialogTitle>
              <DialogDescription className="text-zinc-400">Add a new piece of content to the pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Title</Label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Content title..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Hook</Label>
                <Textarea
                  value={newItem.hook}
                  onChange={(e) => setNewItem({ ...newItem, hook: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="The hook or opening line..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Platform</Label>
                <Select value={newItem.platform} onValueChange={(v) => setNewItem({ ...newItem, platform: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">Cancel</Button>
                <Button onClick={createItem} className="bg-violet-600 hover:bg-violet-700">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map(col => (
          <Card key={col.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${col.headerBg} border-b ${col.color}`}>
              <h3 className={`text-sm font-semibold ${col.headerText}`}>{col.title}</h3>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                  {getColumnItems(col.id).length}
                </Badge>
                <button
                  onClick={() => { setNewItem({ ...newItem, stage: col.id }); setIsDialogOpen(true) }}
                  className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-2 min-h-[200px] p-2 flex-1">
              {getColumnItems(col.id).map(item => {
                const PlatformIcon = PLATFORM_ICONS[item.platform] || Linkedin
                return (
                  <Card key={item.id} className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white leading-tight">{item.title}</h4>
                        <button onClick={() => deleteItem(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-0.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {item.hook && (
                        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{item.hook}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`${PLATFORM_COLORS[item.platform] || 'bg-zinc-700 text-zinc-300'} text-[10px] px-1.5 py-0`}>
                          <PlatformIcon className="h-2.5 w-2.5 mr-0.5" />
                          {item.platform}
                        </Badge>
                        {item.tool && (
                          <Badge variant="secondary" className="bg-zinc-700/50 text-zinc-400 text-[10px] px-1.5 py-0">
                            {item.tool}
                          </Badge>
                        )}
                      </div>
                      <Select value={item.stage} onValueChange={(v) => updateStage(item.id, v)}>
                        <SelectTrigger className="w-full h-6 bg-zinc-700/50 border-zinc-600 text-[10px] mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {COLUMNS.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )
              })}
              {getColumnItems(col.id).length === 0 && (
                <div className="flex items-center justify-center h-24 text-zinc-600 text-xs text-center px-2">
                  No items yet
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

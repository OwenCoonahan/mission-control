'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Film, Plus, GripVertical, Trash2, Youtube, Twitter, Linkedin } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  description: string
  status: 'ideas' | 'scripting' | 'thumbnail' | 'filming' | 'editing' | 'published'
  platform: 'youtube' | 'twitter' | 'linkedin'
  assignedTo: 'Owen' | 'Henry'
  createdAt: string
  updatedAt: string
}

const COLUMNS = [
  { id: 'ideas', title: '💡 Ideas', color: 'border-violet-500/30' },
  { id: 'scripting', title: '✍️ Scripting', color: 'border-blue-500/30' },
  { id: 'thumbnail', title: '🎨 Thumbnail', color: 'border-orange-500/30' },
  { id: 'filming', title: '🎬 Filming', color: 'border-yellow-500/30' },
  { id: 'editing', title: '✂️ Editing', color: 'border-emerald-500/30' },
  { id: 'published', title: '🚀 Published', color: 'border-green-500/30' },
] as const

const PLATFORM_ICONS = {
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
}

const PLATFORM_COLORS = {
  youtube: 'bg-red-500/20 text-red-400',
  twitter: 'bg-blue-400/20 text-blue-400',
  linkedin: 'bg-blue-600/20 text-blue-300',
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<{
    title: string
    description: string
    platform: 'youtube' | 'twitter' | 'linkedin'
    assignedTo: 'Owen' | 'Henry'
    status: string
  }>({
    title: '',
    description: '',
    platform: 'youtube',
    assignedTo: 'Owen',
    status: 'ideas',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  async function fetchContent() {
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
      setItems(data.items || [])
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
        setNewItem({ title: '', description: '', platform: 'youtube', assignedTo: 'Owen', status: 'ideas' })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create content:', error)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
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

  function getColumnItems(status: string) {
    return items.filter(item => item.status === status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
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
                <Label className="text-white">Description</Label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Brief description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Platform</Label>
                  <Select value={newItem.platform} onValueChange={(v) => setNewItem({ ...newItem, platform: v as 'youtube' | 'twitter' | 'linkedin' })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Assigned To</Label>
                  <Select value={newItem.assignedTo} onValueChange={(v) => setNewItem({ ...newItem, assignedTo: v as 'Owen' | 'Henry' })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="Owen">Owen</SelectItem>
                      <SelectItem value="Henry">Henry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-300">{col.title}</h3>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-500 text-xs">
                {getColumnItems(col.id).length}
              </Badge>
            </div>
            <div className={`space-y-2 min-h-[200px] border-t-2 ${col.color} pt-3`}>
              {getColumnItems(col.id).map(item => {
                const PlatformIcon = PLATFORM_ICONS[item.platform]
                return (
                  <Card key={item.id} className="bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white leading-tight">{item.title}</h4>
                        <button onClick={() => deleteItem(item.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-0.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`${PLATFORM_COLORS[item.platform]} text-[10px] px-1.5 py-0`}>
                          <PlatformIcon className="h-2.5 w-2.5 mr-0.5" />
                          {item.platform}
                        </Badge>
                        <Badge variant="secondary" className="bg-zinc-700/50 text-zinc-400 text-[10px] px-1.5 py-0">
                          {item.assignedTo}
                        </Badge>
                      </div>
                      <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v)}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

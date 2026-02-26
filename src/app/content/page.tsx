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
import { Plus, Trash2 } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  platform: string
  stage: string
  hook: string
  tool: string | null
  createdAt: string
  description?: string
  status?: string
}

const COLUMNS = [
  { id: 'ideas', title: 'Ideas' },
  { id: 'scripting', title: 'Scripting' },
  { id: 'ready', title: 'Ready' },
  { id: 'posting', title: 'Posting' },
  { id: 'published', title: 'Published' },
] as const

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', hook: '', platform: 'linkedin', stage: 'ideas' })

  useEffect(() => { fetchContent() }, [])

  async function fetchContent() {
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
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
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-white">Content</h1>
          <p className="text-sm text-zinc-500 mt-1">Track content from idea to published</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">New Content</DialogTitle>
              <DialogDescription className="text-zinc-500">Add content to the pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs">Title</Label>
                <Input value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Content title..." />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs">Hook</Label>
                <Textarea value={newItem.hook} onChange={(e) => setNewItem({ ...newItem, hook: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Opening line..." />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs">Platform</Label>
                <Select value={newItem.platform} onValueChange={(v) => setNewItem({ ...newItem, platform: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 text-xs">Cancel</Button>
                <Button onClick={createItem} className="bg-violet-600 hover:bg-violet-700 h-8 text-xs">Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400">{col.title}</h3>
              <span className="text-xs text-zinc-600">{getColumnItems(col.id).length}</span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {getColumnItems(col.id).map(item => (
                <Card key={item.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-sm text-zinc-200 leading-tight">{item.title}</h4>
                      <button onClick={() => deleteItem(item.id)} className="text-zinc-700 hover:text-red-400 transition-colors p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {item.hook && <p className="text-xs text-zinc-600 mb-2 line-clamp-2">{item.hook}</p>}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{item.platform}</span>
                      {item.tool && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{item.tool}</span>}
                    </div>
                    <Select value={item.stage} onValueChange={(v) => updateStage(item.id, v)}>
                      <SelectTrigger className="w-full h-6 bg-zinc-800 border-zinc-700 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {COLUMNS.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
              {getColumnItems(col.id).length === 0 && (
                <div className="flex items-center justify-center h-24 text-zinc-700 text-xs">No items</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

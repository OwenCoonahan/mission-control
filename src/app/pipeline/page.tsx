'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Handshake, Mail, Clock } from 'lucide-react'

interface Lead {
  id: string
  name: string
  company: string
  role: string
  status: string
  source: string
  lastContact: string
  nextAction: string
  priority: 'hot' | 'warm' | 'cool' | 'closed'
  email?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  warm: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cool: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
}

function daysSince(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pipeline')
      .then(r => r.json())
      .then(data => setLeads(data.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-700 rounded w-48 mb-8"></div>
          <div className="h-64 bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  const hotLeads = leads.filter(l => l.priority === 'hot')
  const warmLeads = leads.filter(l => l.priority === 'warm')
  const coolLeads = leads.filter(l => l.priority === 'cool')

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Handshake className="h-8 w-8 text-violet-400" />
          Pipeline
        </h1>
        <p className="text-zinc-400">Track warm leads and outreach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{leads.length}</div>
            <div className="text-xs text-zinc-400">Total Leads</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{hotLeads.length}</div>
            <div className="text-xs text-zinc-400">Hot</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-400">{warmLeads.length}</div>
            <div className="text-xs text-zinc-400">Warm</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{coolLeads.length}</div>
            <div className="text-xs text-zinc-400">Cool</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4">Name</th>
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4">Role / Company</th>
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4">Priority</th>
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4">Source</th>
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3 pr-4">Days Ago</th>
                  <th className="text-left text-xs font-medium text-zinc-400 pb-3">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{lead.name}</span>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="text-zinc-500 hover:text-violet-400">
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-zinc-300">{lead.role}</span>
                      {lead.company && (
                        <span className="text-sm text-zinc-500"> · {lead.company}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={PRIORITY_COLORS[lead.priority]}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-sm text-zinc-400">{lead.source}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span className={`text-sm ${daysSince(lead.lastContact) > 3 ? 'text-red-400' : 'text-zinc-400'}`}>
                          {daysSince(lead.lastContact)}d
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-zinc-300">{lead.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

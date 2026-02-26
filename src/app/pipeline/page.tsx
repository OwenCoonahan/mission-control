'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Clock } from 'lucide-react'

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

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
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
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8"></div>
          <div className="h-64 bg-zinc-900 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const hotLeads = leads.filter(l => l.priority === 'hot')
  const warmLeads = leads.filter(l => l.priority === 'warm')
  const coolLeads = leads.filter(l => l.priority === 'cool')

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Pipeline</h1>
        <p className="text-sm text-zinc-500 mt-1">Track warm leads and outreach</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: leads.length, color: 'text-white' },
          { label: 'Hot', value: hotLeads.length, color: 'text-red-400' },
          { label: 'Warm', value: warmLeads.length, color: 'text-orange-400' },
          { label: 'Cool', value: coolLeads.length, color: 'text-zinc-400' },
        ].map(stat => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-200 text-sm font-medium">All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3 pr-4">Name</th>
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3 pr-4">Role / Company</th>
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3 pr-4">Priority</th>
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3 pr-4">Source</th>
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3 pr-4">Last Contact</th>
                  <th className="text-left text-xs font-medium text-zinc-500 pb-3">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-200">{lead.name}</span>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="text-zinc-600 hover:text-violet-400">
                            <Mail className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-zinc-400">{lead.role}</span>
                      {lead.company && <span className="text-sm text-zinc-600"> · {lead.company}</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                        lead.priority === 'hot' ? 'bg-red-500/10 text-red-400' :
                        lead.priority === 'warm' ? 'bg-orange-500/10 text-orange-400' :
                        lead.priority === 'closed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>{lead.priority}</span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-zinc-500">{lead.source}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-sm flex items-center gap-1 ${daysSince(lead.lastContact) > 3 ? 'text-red-400' : 'text-zinc-500'}`}>
                        <Clock className="h-3 w-3" /> {daysSince(lead.lastContact)}d ago
                      </span>
                    </td>
                    <td className="py-3 text-sm text-zinc-400">{lead.nextAction}</td>
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

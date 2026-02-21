'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, Search, Pen, Palette, Code, Zap } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  description: string
  icon: React.ReactNode
  skills: string[]
  color: string
  bgColor: string
  borderColor: string
  isLead?: boolean
  status: 'active' | 'standby' | 'offline'
}

const STATUS_COLORS = {
  active: 'bg-emerald-400',
  standby: 'bg-yellow-400',
  offline: 'bg-zinc-500',
}

const team: TeamMember[] = [
  {
    name: 'Henry',
    role: 'Chief of Staff',
    description: 'Orchestration, clarity, and delegation. Henry manages the team, keeps Owen focused, and ensures nothing falls through the cracks. The bridge between Owen\'s vision and execution.',
    icon: <Crown className="h-6 w-6" />,
    skills: ['Orchestration', 'Clarity', 'Delegation', 'Planning', 'Memory'],
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    isLead: true,
    status: 'active',
  },
  {
    name: 'Scout',
    role: 'Research Analyst',
    description: 'Finds data, tracks signals, and surfaces insights. Scout monitors energy markets, interconnection queues, and industry news to keep Owen ahead of the curve.',
    icon: <Search className="h-6 w-6" />,
    skills: ['Research', 'Data Analysis', 'Signal Tracking', 'Market Intelligence'],
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    status: 'active',
  },
  {
    name: 'Quill',
    role: 'Content Writer',
    description: 'Writes copy, designs content strategy, and crafts narratives. From Twitter threads to long-form articles, Quill turns ideas into polished words.',
    icon: <Pen className="h-6 w-6" />,
    skills: ['Copywriting', 'Content Strategy', 'Storytelling', 'Social Media'],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    status: 'standby',
  },
  {
    name: 'Pixel',
    role: 'Designer',
    description: 'Creates thumbnails, visuals, and design assets. Pixel handles the visual side of content production, ensuring everything looks professional and on-brand.',
    icon: <Palette className="h-6 w-6" />,
    skills: ['Thumbnails', 'Visual Design', 'Branding', 'UI/UX'],
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    status: 'standby',
  },
  {
    name: 'Codex',
    role: 'Lead Engineer',
    description: 'Builds, fixes, and automates. Codex handles all technical work — from building Mission Control to writing scripts, APIs, and data pipelines.',
    icon: <Code className="h-6 w-6" />,
    skills: ['Full-Stack Dev', 'Automation', 'APIs', 'Data Pipelines', 'DevOps'],
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    status: 'active',
  },
]

export default function TeamPage() {
  const henry = team[0]
  const agents = team.slice(1)

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-violet-400" />
          Meet the Team
        </h1>
        <p className="text-zinc-400">Owen&apos;s AI agent team — specialized roles working in concert</p>
      </div>

      {/* Henry - Lead Card */}
      <Card className={`${henry.bgColor} border ${henry.borderColor} mb-8`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className={`w-14 h-14 rounded-xl ${henry.bgColor} border ${henry.borderColor} flex items-center justify-center ${henry.color}`}>
              {henry.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white">{henry.name}</h2>
                <Badge className={`${henry.bgColor} ${henry.color} border ${henry.borderColor}`}>
                  {henry.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[henry.status]}`} />
                  <span className="text-xs text-zinc-500 capitalize">{henry.status}</span>
                </div>
              </div>
              <p className="text-zinc-300 text-sm mb-3">{henry.description}</p>
              <div className="flex flex-wrap gap-2">
                {henry.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <Card key={agent.name} className={`bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${agent.bgColor} border ${agent.borderColor} flex items-center justify-center ${agent.color} flex-shrink-0`}>
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[agent.status]}`} />
                      <span className="text-xs text-zinc-500 capitalize">{agent.status}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${agent.color} mb-2`}>{agent.role}</div>
                  <p className="text-zinc-400 text-sm mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-zinc-800 text-zinc-500 text-[10px]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

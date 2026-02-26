'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react'

interface Milestone {
  title: string
  done: boolean
}

interface QuarterlyGoal {
  title: string
  deadline: string
  progress: number
  reward: string
  punishment: string
}

interface Pillar {
  id: string
  title: string
  emoji: string
  color: string
  oneYearVision: string
  currentReality: Record<string, string>
  quarterlyGoal: QuarterlyGoal
  monthlyMilestones: Milestone[]
  weeklyActions: string[]
}

interface VisionData {
  fiveYearVision: string
  pillars: Pillar[]
}

function getDaysLeftInQ1(): number {
  const now = new Date()
  const endOfQ1 = new Date(2026, 2, 31)
  return Math.max(0, Math.ceil((endOfQ1.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatCurrentReality(reality: Record<string, string>): string[] {
  return Object.entries(reality).map(([key, val]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    return `${label}: ${val}`
  })
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const [expanded, setExpanded] = useState(false)
  const daysLeft = getDaysLeftInQ1()

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-medium text-white">{pillar.title}</h3>
      </div>

      <p className="text-zinc-400 text-sm leading-relaxed">&ldquo;{pillar.oneYearVision}&rdquo;</p>

      <div className="flex flex-wrap gap-1.5">
        {formatCurrentReality(pillar.currentReality).map((item, i) => (
          <span key={i} className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">{item}</span>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">Q1 Goal</span>
          <span className="text-xs text-zinc-600">{daysLeft}d left</span>
        </div>
        <p className="text-sm text-zinc-400">{pillar.quarterlyGoal.title}</p>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pillar.quarterlyGoal.progress}%` }} />
        </div>
        <span className="text-xs text-zinc-600">{pillar.quarterlyGoal.progress}%</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 text-sm">
        <div className="flex items-start gap-2 bg-zinc-800/40 rounded-md px-3 py-2">
          <span className="text-emerald-400 text-xs">Reward:</span>
          <span className="text-zinc-400 text-xs">{pillar.quarterlyGoal.reward}</span>
        </div>
        <div className="flex items-start gap-2 bg-zinc-800/40 rounded-md px-3 py-2">
          <span className="text-red-400 text-xs">Stakes:</span>
          <span className="text-zinc-400 text-xs">{pillar.quarterlyGoal.punishment}</span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Hide details' : 'Milestones & actions'}
      </button>

      {expanded && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Monthly Milestones</h4>
            <div className="space-y-1">
              {pillar.monthlyMilestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {m.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-zinc-700" />}
                  <span className={m.done ? 'line-through text-zinc-600' : 'text-zinc-400'}>{m.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Weekly Actions</h4>
            <ul className="space-y-1">
              {pillar.weeklyActions.map((action, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-600 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VisionPage() {
  const [data, setData] = useState<VisionData | null>(null)

  useEffect(() => {
    fetch('/api/vision').then(r => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    )
  }

  const visionParagraphs = data.fiveYearVision.split('\n\n')

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      {/* Vision */}
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">5-Year Vision</p>
        {visionParagraphs.map((p, i) => (
          <p key={i} className={`text-lg md:text-xl leading-relaxed text-zinc-300 mb-4 last:mb-0 ${
            i === visionParagraphs.length - 1 ? 'font-medium text-white' : ''
          }`}>
            {p}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.pillars.map(pillar => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  )
}

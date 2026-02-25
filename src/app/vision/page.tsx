'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

const colorMap: Record<string, { border: string; bg: string; text: string; progress: string; glow: string }> = {
  emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', progress: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', progress: 'bg-orange-500', glow: 'shadow-orange-500/20' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-400', progress: 'bg-violet-500', glow: 'shadow-violet-500/20' },
  rose: { border: 'border-l-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400', progress: 'bg-rose-500', glow: 'shadow-rose-500/20' },
  sky: { border: 'border-l-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-400', progress: 'bg-sky-500', glow: 'shadow-sky-500/20' },
  yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', progress: 'bg-yellow-500', glow: 'shadow-yellow-500/20' },
}

function getDaysLeftInQ1(): number {
  const now = new Date()
  const endOfQ1 = new Date(2026, 2, 31) // March 31, 2026
  const diff = endOfQ1.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatCurrentReality(reality: Record<string, string>): string[] {
  return Object.entries(reality).map(([key, val]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    return `${label}: ${val}`
  })
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const [expanded, setExpanded] = useState(false)
  const colors = colorMap[pillar.color] || colorMap.emerald
  const daysLeft = getDaysLeftInQ1()

  return (
    <div className={`bg-zinc-900 rounded-xl border-l-4 ${colors.border} p-6 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{pillar.emoji}</span>
        <h3 className={`text-lg font-bold ${colors.text}`}>{pillar.title}</h3>
      </div>

      {/* 1-Year Vision */}
      <p className="text-zinc-300 italic text-sm leading-relaxed">&ldquo;{pillar.oneYearVision}&rdquo;</p>

      {/* Current Reality */}
      <div className="flex flex-wrap gap-2">
        {formatCurrentReality(pillar.currentReality).map((item, i) => (
          <span key={i} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
            {item}
          </span>
        ))}
      </div>

      {/* Quarterly Goal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-200">Q1 Goal</span>
          <span className="text-xs text-zinc-500">{daysLeft} days left</span>
        </div>
        <p className="text-sm text-zinc-300">{pillar.quarterlyGoal.title}</p>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className={`${colors.progress} h-2 rounded-full transition-all`}
            style={{ width: `${pillar.quarterlyGoal.progress}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500">{pillar.quarterlyGoal.progress}% complete</span>
      </div>

      {/* Stakes */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
          <span>🏆</span>
          <span className="text-emerald-400">{pillar.quarterlyGoal.reward}</span>
        </div>
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          <span>💀</span>
          <span className="text-red-400">{pillar.quarterlyGoal.punishment}</span>
        </div>
      </div>

      {/* Expandable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? 'Hide details' : 'Monthly milestones & weekly actions'}
      </button>

      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Monthly Milestones */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Monthly Milestones</h4>
            <div className="space-y-1.5">
              {pillar.monthlyMilestones.map((m, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.done}
                    readOnly
                    className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                  />
                  <span className={m.done ? 'line-through text-zinc-600' : ''}>{m.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weekly Actions */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Weekly Actions</h4>
            <ul className="space-y-1">
              {pillar.weeklyActions.map((action, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${colors.progress} flex-shrink-0`} />
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
    fetch('/api/vision')
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="animate-pulse text-zinc-500">Loading vision...</div>
      </div>
    )
  }

  const visionParagraphs = data.fiveYearVision.split('\n\n')

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950/30 border border-zinc-800 p-8 md:p-12 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400 mb-6">
            The 5-Year Vision
          </h1>
          {visionParagraphs.map((p, i) => (
            <p
              key={i}
              className={`text-xl md:text-2xl leading-relaxed text-zinc-200 mb-6 last:mb-0 ${
                i === visionParagraphs.length - 1
                  ? 'font-bold text-white tracking-wide'
                  : 'font-light'
              }`}
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Pillar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.pillars.map(pillar => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  )
}

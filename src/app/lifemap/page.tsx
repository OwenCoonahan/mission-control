'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sparkles,
  Target,
  ChevronDown,
  ChevronRight,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  DollarSign,
} from 'lucide-react'

interface Action {
  id: string
  text: string
  done: boolean
}

interface Phase {
  id: string
  name: string
  timeline: string
  milestone: string
  actions: Action[]
}

interface Goal {
  id: string
  title: string
  emoji: string
  target: string
  doneDef: string
  color: string
  phases: Phase[]
}

interface Lever {
  name: string
  feeds: string[]
  state: string
}

interface LifeMap {
  vision: {
    identity: string
    lifestyle: string[]
    feeling: string
  }
  goals: Goal[]
  levers: Lever[]
}

const GOAL_COLORS: Record<string, { bg: string; border: string; progress: string; badge: string; text: string }> = {
  emerald: {
    bg: 'from-emerald-950/60 to-emerald-900/20',
    border: 'border-emerald-500/30',
    progress: 'bg-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    text: 'text-emerald-400',
  },
  orange: {
    bg: 'from-orange-950/60 to-orange-900/20',
    border: 'border-orange-500/30',
    progress: 'bg-orange-500',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    text: 'text-orange-400',
  },
  rose: {
    bg: 'from-rose-950/60 to-rose-900/20',
    border: 'border-rose-500/30',
    progress: 'bg-rose-500',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    text: 'text-rose-400',
  },
  violet: {
    bg: 'from-violet-950/60 to-violet-900/20',
    border: 'border-violet-500/30',
    progress: 'bg-violet-500',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    text: 'text-violet-400',
  },
}

const GOAL_ICONS: Record<string, any> = {
  financial: DollarSign,
  physical: Dumbbell,
  relationships: Heart,
  mental: Brain,
}

export default function LifeMapPage() {
  const [data, setData] = useState<LifeMap | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-expand first phase of each goal
  useEffect(() => {
    if (data) {
      const firstPhases = new Set(data.goals.map(g => g.phases[0]?.id).filter(Boolean))
      setExpandedPhases(firstPhases)
    }
  }, [data])

  async function fetchData() {
    try {
      const res = await fetch('/api/lifemap')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleAction(actionId: string, done: boolean) {
    // Optimistic update
    if (data) {
      const updated = { ...data }
      for (const goal of updated.goals) {
        for (const phase of goal.phases) {
          const action = phase.actions.find(a => a.id === actionId)
          if (action) {
            action.done = done
            break
          }
        }
      }
      setData({ ...updated })
    }

    await fetch('/api/lifemap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, done }),
    })
  }

  function togglePhase(phaseId: string) {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }

  function getGoalProgress(goal: Goal): number {
    const allActions = goal.phases.flatMap(p => p.actions)
    if (allActions.length === 0) return 0
    return Math.round((allActions.filter(a => a.done).length / allActions.length) * 100)
  }

  function getPhaseProgress(phase: Phase): number {
    if (phase.actions.length === 0) return 0
    return Math.round((phase.actions.filter(a => a.done).length / phase.actions.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-zinc-800 rounded w-48" />
          <div className="h-48 bg-zinc-800 rounded-lg" />
          <div className="h-96 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-amber-400" />
          Life Map
        </h1>
        <p className="text-zinc-400">Vision → Goals → Milestones → Actions</p>
      </div>

      {/* Vision Card */}
      <Card className="bg-gradient-to-br from-amber-950/40 to-zinc-900 border-amber-500/20 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-300 text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            The Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white text-lg font-medium leading-relaxed italic">
            "{data.vision.identity}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.vision.lifestyle.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-amber-400 mt-0.5">✦</span>
                {item}
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-amber-500/10">
            <p className="text-amber-200/80 text-sm font-medium">
              How it feels: {data.vision.feeling}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {data.goals.map(goal => {
          const progress = getGoalProgress(goal)
          const colors = GOAL_COLORS[goal.color] || GOAL_COLORS.violet
          return (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
              <span className="text-2xl">{goal.emoji}</span>
              <div className="text-2xl font-bold text-white mt-1">{progress}%</div>
              <div className="text-xs text-zinc-500 mt-1 truncate">{goal.title.split(' ').slice(0, 2).join(' ')}</div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${colors.progress} rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Goals */}
      <div className="space-y-6">
        {data.goals.map(goal => {
          const colors = GOAL_COLORS[goal.color] || GOAL_COLORS.violet
          const Icon = GOAL_ICONS[goal.id] || Target
          const progress = getGoalProgress(goal)
          const totalActions = goal.phases.flatMap(p => p.actions).length
          const doneActions = goal.phases.flatMap(p => p.actions).filter(a => a.done).length

          return (
            <Card key={goal.id} className={`bg-gradient-to-br ${colors.bg} ${colors.border} overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <CardTitle className="text-xl text-white">{goal.title}</CardTitle>
                      <p className="text-sm text-zinc-400 mt-0.5">{goal.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{progress}%</div>
                    <div className="text-xs text-zinc-500">{doneActions}/{totalActions} actions</div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div className={`h-full ${colors.progress} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  <span className="font-medium text-zinc-400">Done when:</span> {goal.doneDef}
                </p>
              </CardHeader>

              <CardContent className="space-y-2">
                {goal.phases.map((phase, phaseIdx) => {
                  const isExpanded = expandedPhases.has(phase.id)
                  const phaseProgress = getPhaseProgress(phase)
                  const phaseDone = phase.actions.filter(a => a.done).length
                  const isCurrentPhase = phaseIdx === 0 || goal.phases[phaseIdx - 1].actions.every(a => a.done)

                  return (
                    <div key={phase.id} className="bg-zinc-900/50 rounded-lg border border-zinc-800/50 overflow-hidden">
                      {/* Phase Header */}
                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ?
                            <ChevronDown className="h-4 w-4 text-zinc-500" /> :
                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                          }
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{phase.name}</span>
                              {isCurrentPhase && phaseProgress < 100 && (
                                <Badge className={`text-[10px] px-1.5 py-0 ${colors.badge}`}>CURRENT</Badge>
                              )}
                              {phaseProgress === 100 && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-300 border-green-500/30">DONE</Badge>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500">{phase.timeline} · {phase.milestone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">{phaseDone}/{phase.actions.length}</span>
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${colors.progress} rounded-full transition-all`} style={{ width: `${phaseProgress}%` }} />
                          </div>
                        </div>
                      </button>

                      {/* Actions */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-1">
                          {phase.actions.map(action => (
                            <label
                              key={action.id}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-zinc-800/30 cursor-pointer group transition-colors"
                            >
                              <Checkbox
                                checked={action.done}
                                onCheckedChange={(checked) => toggleAction(action.id, checked as boolean)}
                                className="mt-0.5 border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <span className={`text-sm leading-relaxed ${action.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                {action.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Levers */}
      <Card className="bg-zinc-900 border-zinc-800 mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            The Levers
          </CardTitle>
          <p className="text-xs text-zinc-500">Systems that make everything work</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.levers.map((lever, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-white">{lever.name}</span>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Feeds: {lever.feeds.join(', ')}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                  {lever.state}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-zinc-600 text-xs mt-8 mb-4">
        Updated Feb 25, 2026 · Review weekly · The vision feeds your soul
      </p>
    </div>
  )
}

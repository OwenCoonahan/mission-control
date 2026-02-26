'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Target,
  ChevronDown,
  ChevronRight,
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

export default function LifeMapPage() {
  const [data, setData] = useState<LifeMap | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

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
      <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-32 bg-zinc-900 rounded-lg" />
          <div className="h-64 bg-zinc-900 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white">Life Map</h1>
        <p className="text-sm text-zinc-500 mt-1">Vision → Goals → Milestones → Actions</p>
      </div>

      {/* Vision */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardContent className="py-6">
          <p className="text-zinc-200 text-base leading-relaxed">
            &ldquo;{data.vision.identity}&rdquo;
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.vision.lifestyle.map((item, i) => (
              <span key={i} className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded">
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4">{data.vision.feeling}</p>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {data.goals.map(goal => {
          const progress = getGoalProgress(goal)
          return (
            <div key={goal.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-zinc-500 mb-1 truncate">{goal.title.split(' ').slice(0, 2).join(' ')}</div>
              <div className="text-xl font-semibold text-white">{progress}%</div>
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Goals */}
      <div className="space-y-4">
        {data.goals.map(goal => {
          const progress = getGoalProgress(goal)
          const totalActions = goal.phases.flatMap(p => p.actions).length
          const doneActions = goal.phases.flatMap(p => p.actions).filter(a => a.done).length

          return (
            <Card key={goal.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">{goal.title}</CardTitle>
                    <p className="text-sm text-zinc-500 mt-0.5">{goal.target}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-white">{progress}%</div>
                    <div className="text-xs text-zinc-600">{doneActions}/{totalActions}</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  <span className="text-zinc-500">Done when:</span> {goal.doneDef}
                </p>
              </CardHeader>

              <CardContent className="space-y-1.5">
                {goal.phases.map((phase, phaseIdx) => {
                  const isExpanded = expandedPhases.has(phase.id)
                  const phaseProgress = getPhaseProgress(phase)
                  const phaseDone = phase.actions.filter(a => a.done).length
                  const isCurrentPhase = phaseIdx === 0 || goal.phases[phaseIdx - 1].actions.every(a => a.done)

                  return (
                    <div key={phase.id} className="bg-zinc-800/30 rounded-lg border border-zinc-800/50 overflow-hidden">
                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ?
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-600" /> :
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                          }
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200">{phase.name}</span>
                              {isCurrentPhase && phaseProgress < 100 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">CURRENT</span>
                              )}
                              {phaseProgress === 100 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">DONE</span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-600">{phase.timeline} · {phase.milestone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-zinc-600">{phaseDone}/{phase.actions.length}</span>
                          <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${phaseProgress}%` }} />
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-0.5">
                          {phase.actions.map(action => (
                            <label
                              key={action.id}
                              className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-zinc-800/40 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={action.done}
                                onCheckedChange={(checked) => toggleAction(action.id, checked as boolean)}
                                className="mt-0.5 border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <span className={`text-sm leading-relaxed ${action.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
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
          <CardTitle className="text-zinc-200 text-sm font-medium">Levers</CardTitle>
          <p className="text-xs text-zinc-600">Systems that make everything work</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.levers.map((lever, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-zinc-800/40 rounded-md">
                <div>
                  <span className="text-sm text-zinc-200">{lever.name}</span>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Feeds: {lever.feeds.join(', ')}
                  </div>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  {lever.state}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

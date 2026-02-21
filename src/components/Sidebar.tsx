'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Activity,
  Command,
  Brain,
  Calendar,
  Film,
  FolderKanban,
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Content', href: '/content', icon: Film },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Goals', href: '/goals', icon: Target },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-zinc-900 overflow-y-auto border-r border-zinc-800">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <Command className="h-8 w-8 text-violet-400" />
            <h1 className="ml-3 text-xl font-bold text-white">Mission Control</h1>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-3 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-violet-400 bg-violet-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="flex-shrink-0 px-4 py-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              Owen&apos;s Command Center
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Command,
  Brain,
  Calendar,
  Film,
  FolderKanban,
  Handshake,
  Map,
  Eye,
  Menu,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navigation = [
  { name: 'Life Map', href: '/lifemap', icon: Map },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Pipeline', href: '/pipeline', icon: Handshake },
  { name: 'Content', href: '/content', icon: Film },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Vision', href: '/vision', icon: Eye },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 pb-4 space-y-0.5">
      {navigation.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors',
              isActive
                ? 'text-white bg-zinc-800/80'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800/50 px-4 py-3 flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-zinc-400 hover:text-zinc-200 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-950 border-zinc-800 w-64 p-0">
            <SheetHeader className="px-5 pt-6 pb-0">
              <SheetTitle className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200 tracking-tight">
                <Command className="h-5 w-5 text-zinc-400" />
                Mission Control
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Command className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-200 tracking-tight">Mission Control</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-6 bg-zinc-950 overflow-y-auto border-r border-zinc-800/50">
          <div className="flex items-center flex-shrink-0 px-5">
            <Command className="h-6 w-6 text-zinc-400" />
            <h1 className="ml-2.5 text-sm font-semibold text-zinc-200 tracking-tight">Mission Control</h1>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <NavItems />
          </div>
        </div>
      </div>
    </>
  )
}

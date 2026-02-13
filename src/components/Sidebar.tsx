'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  CheckSquare,
  Target,
  Brain,
  Zap,
  Settings,
  Sparkles,
  PanelLeft,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  { title: 'Dashboard', href: '/', icon: Home },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Goals', href: '/goals', icon: Target },
  { title: 'Memory', href: '/memory', icon: Brain },
  { title: 'Activity', href: '/activity', icon: Zap },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all md:hidden',
          isOpen && 'left-[220px]'
        )}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out',
          isOpen ? 'w-60' : 'w-0 md:w-0',
          'md:relative md:translate-x-0',
          !isOpen && '-translate-x-full md:translate-x-0',
          className
        )}
      >
        <div className={cn('flex flex-col h-full', !isOpen && 'hidden')}>
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Mission Control</p>
                <p className="text-xs text-zinc-500">Owen&apos;s HQ</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-bold mb-3 px-3">
              Navigation
            </p>
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-sm shadow-violet-500/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive && 'text-violet-400')} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-xl">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
                  OC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Owen</p>
                <p className="text-xs text-zinc-500">Personal</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'hidden md:flex fixed top-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all',
          isOpen ? 'left-[252px]' : 'left-4'
        )}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </button>
    </>
  );
}

export default Sidebar;

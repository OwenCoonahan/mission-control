'use client';

import { useState, useEffect } from 'react';
import GoalsSection from '@/components/GoalsSection';
import TasksSection from '@/components/TasksSection';
import ActivityFeed from '@/components/ActivityFeed';
import QuickStats from '@/components/QuickStats';
import MemorySection from '@/components/MemorySection';

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Mission Control</h1>
            <p className="text-gray-400 mt-1">{greeting()}, Owen. Let&apos;s get it.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono text-white">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-500 text-sm">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <QuickStats />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Left Column - Goals & Tasks */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <GoalsSection />
          <TasksSection />
        </div>

        {/* Center Column - Main Content */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <MemorySection />
        </div>

        {/* Right Column - Activity Feed */}
        <div className="col-span-12 lg:col-span-3">
          <ActivityFeed />
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';

const memories = [
  {
    id: 'user',
    title: 'USER.md',
    description: 'Full profile, background, psychology, goals',
    icon: '👤',
    lastUpdated: 'Today',
  },
  {
    id: 'memory',
    title: 'MEMORY.md',
    description: 'Long-term memory, key insights, reminders',
    icon: '🧠',
    lastUpdated: 'Today',
  },
  {
    id: 'henry-owen',
    title: 'HENRY_AND_OWEN.md',
    description: 'Working relationship, roles, rules',
    icon: '🤝',
    lastUpdated: 'Today',
  },
  {
    id: 'priorities',
    title: 'PRIORITIES.md',
    description: 'Current goals, weekly tasks, vision',
    icon: '🎯',
    lastUpdated: 'Today',
  },
  {
    id: 'money-beliefs',
    title: 'money-beliefs.md',
    description: 'New operating system for charging/value',
    icon: '💰',
    lastUpdated: 'Yesterday',
  },
  {
    id: 'today',
    title: '2026-02-13.md',
    description: "Today's journal, wins, notes",
    icon: '📅',
    lastUpdated: 'Today',
  },
];

const reminders = [
  { text: "Not everyone will criticize you like dad did.", trigger: "Fear of judgment" },
  { text: "Everything can change in the blink of an eye.", trigger: "Feeling stuck" },
  { text: "You know the playbook, just execute.", trigger: "Overthinking" },
  { text: "Calm mind + full speed — not one OR the other.", trigger: "Out of balance" },
  { text: "$200/hr is your baseline. No justifying.", trigger: "Undercharging" },
];

export default function MemorySection() {
  const [activeTab, setActiveTab] = useState<'files' | 'reminders'>('files');

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🧠</span> Memory & Docs
        </h2>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'files' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'reminders' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Reminders
          </button>
        </div>
      </div>

      {activeTab === 'files' ? (
        <div className="grid grid-cols-2 gap-3">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-all hover:bg-gray-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{mem.icon}</span>
                <span className="text-sm font-medium text-white">{mem.title}</span>
              </div>
              <p className="text-xs text-gray-500">{mem.description}</p>
              <p className="text-xs text-gray-600 mt-2">Updated: {mem.lastUpdated}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder, i) => (
            <div
              key={i}
              className="p-3 bg-gray-800/50 rounded-lg border border-gray-800"
            >
              <p className="text-sm text-white font-medium">&ldquo;{reminder.text}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-2">When: {reminder.trigger}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'frog' | 'high' | 'medium' | 'low';
  time?: string;
}

const initialTasks: Task[] = [
  { id: 1, title: 'OpenClaw presentation (4-5 PM)', completed: false, priority: 'frog', time: '4:00 PM' },
  { id: 2, title: 'Send 5 outreach messages', completed: false, priority: 'high', time: '30 min' },
  { id: 3, title: 'Data ingestion + PDF generation', completed: false, priority: 'high', time: '1 hr' },
  { id: 4, title: 'Landing pages + funnel', completed: false, priority: 'medium' },
  { id: 5, title: 'Posts on Twitter + LinkedIn', completed: false, priority: 'low' },
];

const priorityStyles = {
  frog: 'border-l-green-500 bg-green-500/10',
  high: 'border-l-red-500 bg-red-500/5',
  medium: 'border-l-yellow-500 bg-yellow-500/5',
  low: 'border-l-gray-500 bg-gray-500/5',
};

const priorityLabels = {
  frog: '🐸 FROG',
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '⚪ Low',
};

export default function TasksSection() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📋</span> Today&apos;s Tasks
        </h2>
        <span className="text-sm text-gray-400">{completedCount}/{tasks.length}</span>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border-l-4 ${priorityStyles[task.priority]} cursor-pointer transition-all hover:bg-gray-800/50`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                task.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}>
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{priorityLabels[task.priority]}</span>
                  {task.time && <span className="text-xs text-gray-600">• {task.time}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

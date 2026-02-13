'use client';

const stats = [
  {
    label: 'Days Streak',
    value: '7',
    subtext: 'Morning reflections',
    icon: '🔥',
    trend: '+2 this week',
  },
  {
    label: 'Outreach Sent',
    value: '12',
    subtext: 'This week',
    icon: '📤',
    trend: 'Goal: 25',
  },
  {
    label: 'Pipeline',
    value: '$0',
    subtext: 'Active deals',
    icon: '💰',
    trend: 'First client loading...',
  },
  {
    label: 'Content',
    value: '3',
    subtext: 'Posts this month',
    icon: '📝',
    trend: 'Goal: 8',
  },
  {
    label: 'Cron Health',
    value: '100%',
    subtext: '12 jobs active',
    icon: '⚙️',
    trend: 'All systems go',
  },
];

export default function QuickStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-xs text-gray-500">{stat.subtext}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          <p className="text-xs text-green-400 mt-2">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
}

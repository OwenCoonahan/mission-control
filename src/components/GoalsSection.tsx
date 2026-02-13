'use client';

const goals = [
  {
    id: 1,
    emoji: '🧘',
    title: 'Calm Mind',
    how: 'Less caffeine, deep breathing, deliberate time',
    progress: 70,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    emoji: '📈',
    title: 'Grow Business',
    how: 'Do what moves the needle. Execute the playbook.',
    progress: 35,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 3,
    emoji: '💪',
    title: 'Greek God Body',
    how: 'Eat and workout with discipline',
    progress: 60,
    color: 'from-orange-500 to-red-500',
  },
];

export default function GoalsSection() {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🎯</span> Core Goals
      </h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{goal.emoji}</span>
                <span className="font-medium text-white">{goal.title}</span>
              </div>
              <span className="text-sm text-gray-400">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{goal.how}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

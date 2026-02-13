'use client';

const activities = [
  {
    id: 1,
    time: '12:01 PM',
    action: 'Building Mission Control NextJS app',
    agent: 'henry',
    status: 'in-progress',
  },
  {
    id: 2,
    time: '11:30 AM',
    action: 'Ingested Owen context dump to USER.md',
    agent: 'henry',
    status: 'complete',
  },
  {
    id: 3,
    time: '10:15 AM',
    action: 'Cron delivery test — SUCCESS',
    agent: 'cron',
    status: 'complete',
  },
  {
    id: 4,
    time: '10:10 AM',
    action: 'Fixed cron scheduler state',
    agent: 'henry',
    status: 'complete',
  },
  {
    id: 5,
    time: '10:01 AM',
    action: 'Updated Morning/Evening Planning jobs',
    agent: 'henry',
    status: 'complete',
  },
  {
    id: 6,
    time: '9:57 AM',
    action: 'B-complex supplement analysis',
    agent: 'henry',
    status: 'complete',
  },
];

const statusStyles = {
  'in-progress': 'bg-blue-500',
  'complete': 'bg-green-500',
  'pending': 'bg-yellow-500',
  'error': 'bg-red-500',
};

export default function ActivityFeed() {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 h-fit">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>⚡</span> Live Activity
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full ${statusStyles[activity.status as keyof typeof statusStyles]}`} />
              <div className="w-px h-full bg-gray-800 group-last:hidden" />
            </div>
            <div className="pb-3">
              <p className="text-sm text-white">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-400">@{activity.agent}</span>
                <span className="text-xs text-gray-600">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg hover:bg-gray-800/50">
        View All Activity →
      </button>
    </div>
  );
}

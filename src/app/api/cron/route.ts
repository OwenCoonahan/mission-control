import { NextResponse } from 'next/server';
import * as fs from 'fs';

const CRON_JOBS_PATH = '/Users/castle-owencoonahan/.openclaw/cron/jobs.json';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: 'cron' | 'every' | 'at';
    expr?: string;
    tz?: string;
    everyMs?: number;
    at?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
  delivery?: {
    mode: string;
    channel?: string;
  };
  deleteAfterRun?: boolean;
}

interface FormattedJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  nextRun: string | null;
  lastRun: string | null;
  lastStatus: string | null;
  lastDuration: number | null;
  deliveryMode: string;
  isOneTime: boolean;
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    return schedule.expr + (schedule.tz ? ` (${schedule.tz})` : '');
  }
  if (schedule.kind === 'every' && schedule.everyMs) {
    const hours = schedule.everyMs / (1000 * 60 * 60);
    if (hours >= 1) {
      return `Every ${hours}h`;
    }
    const mins = schedule.everyMs / (1000 * 60);
    return `Every ${mins}m`;
  }
  if (schedule.kind === 'at' && schedule.at) {
    return `At ${new Date(schedule.at).toLocaleString()}`;
  }
  return 'Unknown';
}

function formatTime(ms?: number): string | null {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

export async function GET() {
  try {
    const content = fs.readFileSync(CRON_JOBS_PATH, 'utf-8');
    const data = JSON.parse(content);
    
    const jobs: FormattedJob[] = (data.jobs || []).map((job: CronJob) => ({
      id: job.id,
      name: job.name,
      enabled: job.enabled,
      schedule: formatSchedule(job.schedule),
      nextRun: formatTime(job.state?.nextRunAtMs),
      lastRun: formatTime(job.state?.lastRunAtMs),
      lastStatus: job.state?.lastStatus || null,
      lastDuration: job.state?.lastDurationMs || null,
      deliveryMode: job.delivery?.mode || 'none',
      isOneTime: job.schedule.kind === 'at' || job.deleteAfterRun === true,
    }));
    
    // Sort: enabled first, then by next run time
    jobs.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      if (a.nextRun && b.nextRun) {
        return new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime();
      }
      return 0;
    });
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error reading cron jobs:', error);
    return NextResponse.json({ jobs: [], error: 'Failed to read cron jobs' }, { status: 500 });
  }
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DigestRow, ReadNight, RunStatus, StatusCounts } from './types.js';

type RunEvent = {
  at: string;
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
    && isCalendarDate(value.slice(0, 10));
}

function isRunEvent(value: unknown): value is RunEvent {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  return typeof event.at === 'string' && isTimestamp(event.at)
    && typeof event.job === 'string' && event.job.length > 0
    && (event.status === 'ok' || event.status === 'retry' || event.status === 'fail')
    && (event.owner === null || typeof event.owner === 'string')
    && (event.error === undefined || typeof event.error === 'string');
}

function emptyCounts(): StatusCounts {
  return { ok: 0, retry: 0, fail: 0 };
}

export const readNight: ReadNight = (runsDir, night) => {
  if (!isCalendarDate(night)) throw new RangeError('night must be a valid YYYY-MM-DD date');

  let contents: string;
  try {
    contents = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return { kind: 'missing', night };
    }
    throw error;
  }

  const jobs = new Map<string, DigestRow>();
  const statusCounts = emptyCounts();
  let badLines = 0;
  for (const line of contents.split('\n')) {
    if (line.trim() === '') continue;
    let event: unknown;
    try {
      event = JSON.parse(line);
    } catch {
      badLines++;
      continue;
    }
    if (!isRunEvent(event)) {
      badLines++;
      continue;
    }

    statusCounts[event.status]++;
    const row = jobs.get(event.job);
    if (row) {
      row.runs++;
      row.retries += event.status === 'retry' ? 1 : 0;
      row.statusCounts[event.status]++;
      row.owner = event.owner;
      row.lastStatus = event.status;
      if (event.error !== undefined) row.lastError = event.error;
      row.lastAt = event.at;
    } else {
      const counts = emptyCounts();
      counts[event.status]++;
      jobs.set(event.job, {
        job: event.job,
        owner: event.owner,
        runs: 1,
        retries: event.status === 'retry' ? 1 : 0,
        statusCounts: counts,
        lastStatus: event.status,
        lastError: event.error ?? null,
        firstAt: event.at,
        lastAt: event.at,
      });
    }
  }

  const rows = [...jobs.values()].sort((a, b) => a.job < b.job ? -1 : a.job > b.job ? 1 : 0);
  return { kind: 'found', night, rows, badLines, statusCounts };
};

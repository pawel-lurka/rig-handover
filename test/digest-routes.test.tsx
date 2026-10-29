import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { NightDigest } from '../src/digest/types.js';

type FoundNight = Extract<NightDigest, { kind: 'found' }>;

const night = '2026-10-28';
const at = '2026-10-28T23:00:02+01:00';
const jobs = ['route-job/Z-last', 'route-job/a-first', 'route-job/m-middle'];
const zeroCounts = { ok: 0, retry: 0, fail: 0 };
let runsDir: string;

beforeEach(() => { runsDir = mkdtempSync(join(process.cwd(), '.digest-routes-test-')); });
afterEach(() => { rmSync(runsDir, { recursive: true, force: true }); });

const event = (job: string) => JSON.stringify({ at, job, status: 'ok', owner: 'rook' });
const found = (names: string[], badLines = 0): FoundNight => ({
  kind: 'found', night, badLines, statusCounts: { ...zeroCounts, ok: names.length },
  rows: names.map((job) => ({
    job, owner: 'rook', runs: 1, retries: 0,
    statusCounts: { ...zeroCounts, ok: 1 }, lastStatus: 'ok', lastError: null,
    firstAt: at, lastAt: at,
  })),
});

async function requestBoth(requestedNight = night) {
  const app = createApp({ adapter: 'shim', installed: at, beatEverySeconds: 60, runsDir });
  return {
    html: await app.request(`/digest/${requestedNight}`),
    json: await app.request(`/api/digest/${requestedNight}`),
  };
}

function visibleText(html: string): string {
  return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
}

// Match only visible fixture job names, independent of table tags, classes, or links.
function htmlJobs(html: string): string[] {
  return visibleText(html).match(/route-job\/[A-Za-z-]+/g) ?? [];
}

async function expectFound(contents: string, expected: FoundNight) {
  writeFileSync(join(runsDir, `${night}.jsonl`), contents);
  const { html, json } = await requestBoth();
  expect(html.status).toBe(200);
  expect(json.status).toBe(200);
  expect(html.headers.get('content-type')).toMatch(/^text\/html\b/);
  expect(json.headers.get('content-type')).toMatch(/^application\/json\b/);
  const body: unknown = await json.json();
  expect(body).toEqual(expected);
  const htmlBody = await html.text();
  expect(htmlJobs(htmlBody)).toEqual(expected.rows.map((row) => row.job));
  return htmlBody;
}

describe('digest routes', () => {
  it('serves the same jobs in code-unit order as HTML and the shared JSON contract', async () => {
    await expectFound([event(jobs[2]), event(jobs[1]), event(jobs[0])].join('\n'), found(jobs));
  });

  it('returns 404 for a missing night on both routes', async () => {
    const { html, json } = await requestBoth();
    expect(html.status).toBe(404);
    expect(json.status).toBe(404);
    expect(await json.json()).toEqual({ kind: 'missing', night });
    expect(htmlJobs(await html.text())).toEqual([]);
  });

  it('serves an existing empty night successfully with no jobs or counts', async () => {
    const html = await expectFound('', found([]));
    expect(visibleText(html)).toMatch(/nothing ran/i);
  });

  it('keeps valid jobs around a malformed line and accounts for it without counting blank lines', async () => {
    await expectFound(`${event(jobs[1])}\n{broken\n \t\n${event(jobs[0])}`, found(jobs.slice(0, 2), 1));
  });

  it.each(['not-a-night', '2026-02-30'])('returns 400 for invalid night %s on both routes', async (invalid) => {
    const { html, json } = await requestBoth(invalid);
    expect(html.status).toBe(400);
    expect(json.status).toBe(400);
  });
});

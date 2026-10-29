import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const config = { adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: 'runs' };

describe('status board', () => {
  it('shows the lane banner and digest links with event counts, newest first', async () => {
    const res = await createApp(config).request('/');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('lane-07');
    const newest = '<li><a href="/digest/2026-10-28">2026-10-28</a> · ok 10 / retry 4 / fail 1</li>';
    const older = '<li><a href="/digest/2026-10-27">2026-10-27</a> · ok 7 / retry 0 / fail 0</li>';
    expect(html).toContain(newest);
    expect(html).toContain(older);
    expect(html.indexOf(newest)).toBeLessThan(html.indexOf(older));
  });

  it('counts recovered events, ignores invalid lines, and keeps empty nights', async ({ onTestFinished }) => {
    const runsDir = mkdtempSync(join(process.cwd(), '.status-test-'));
    onTestFinished(() => rmSync(runsDir, { recursive: true, force: true }));
    const events = ['fail', 'retry', 'ok', 'ok'].map((status) => JSON.stringify({
      at: '2026-10-29T01:00:00+01:00', job: 'recovered', owner: null, status,
    }));
    writeFileSync(join(runsDir, '2026-10-29.jsonl'), [...events, '{broken'].join('\n'));
    writeFileSync(join(runsDir, '2026-10-28.jsonl'), '');
    const res = await createApp({ ...config, runsDir }).request('/');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('<li><a href="/digest/2026-10-29">2026-10-29</a> · ok 2 / retry 1 / fail 1</li>');
    expect(html).toContain('<li><a href="/digest/2026-10-28">2026-10-28</a> · ok 0 / retry 0 / fail 0</li>');
  });

  it('health answers with the lane id', async () => {
    const res = await createApp(config).request('/health');
    expect(await res.json()).toEqual({ ok: true, lane: 'lane-07' });
  });
});

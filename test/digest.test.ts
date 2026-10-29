import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/reader.js';

const night = '2026-10-28';
const event = (overrides: Record<string, unknown> = {}) => ({
  at: '2026-10-28T23:00:02+01:00', job: 'job', status: 'ok', owner: 'rook', ...overrides,
});
const jsonl = (...events: unknown[]) => events.map((value) => JSON.stringify(value)).join('\n');
let runsDir: string;

beforeEach(() => { runsDir = mkdtempSync(join(process.cwd(), '.digest-test-')); });
afterEach(() => { rmSync(runsDir, { recursive: true, force: true }); });

function read(contents: string) {
  writeFileSync(join(runsDir, `${night}.jsonl`), contents);
  const result = readNight(runsDir, night);
  expect(result.kind).toBe('found');
  if (result.kind !== 'found') throw new Error('Expected an existing night');
  return result;
}

describe('readNight', () => {
  it('reads the real night: five sorted jobs, fifteen events, and one bad line', () => {
    const path = join(process.cwd(), 'runs', `${night}.jsonl`);
    const before = readFileSync(path);
    const result = readNight(join(process.cwd(), 'runs'), night);
    expect(result).toEqual({
      kind: 'found', night, badLines: 1, statusCounts: { ok: 10, retry: 4, fail: 1 },
      rows: [
        {
          job: 'digest/render', owner: null, runs: 1, retries: 0,
          statusCounts: { ok: 1, retry: 0, fail: 0 }, lastStatus: 'ok', lastError: null,
          firstAt: '2026-10-29T05:41:09+01:00', lastAt: '2026-10-29T05:41:09+01:00',
        },
        {
          job: 'fixtures/refresh', owner: 'rook', runs: 4, retries: 3,
          statusCounts: { ok: 1, retry: 3, fail: 0 }, lastStatus: 'ok', lastError: 'upstream 503',
          firstAt: '2026-10-29T01:30:00+01:00', lastAt: '2026-10-29T01:37:00+01:00',
        },
        {
          job: 'lane/sync', owner: 'rook', runs: 8, retries: 1,
          statusCounts: { ok: 7, retry: 1, fail: 0 }, lastStatus: 'ok', lastError: 'lock held',
          firstAt: '2026-10-28T23:00:06+01:00', lastAt: '2026-10-29T05:00:04+01:00',
        },
        {
          job: 'notes/backup', owner: 'lane-07', runs: 1, retries: 0,
          statusCounts: { ok: 0, retry: 0, fail: 1 }, lastStatus: 'fail', lastError: 'quota exceeded',
          firstAt: '2026-10-29T04:00:01+01:00', lastAt: '2026-10-29T04:00:01+01:00',
        },
        {
          job: 'rig/rotate-logs', owner: 'lane-07', runs: 1, retries: 0,
          statusCounts: { ok: 1, retry: 0, fail: 0 }, lastStatus: 'ok', lastError: null,
          firstAt: '2026-10-28T23:00:02+01:00', lastAt: '2026-10-28T23:00:02+01:00',
        },
      ],
    });
    expect(readFileSync(path)).toEqual(before);
  });

  it('aggregates in file order, preserving errors after recovery and each time offset', () => {
    const result = read(jsonl(
      event({ job: 'z', status: 'fail', error: 'first', at: '2026-10-29T03:00:00.123+02:00' }),
      event({ job: 'z', status: 'retry', error: 'latest' }),
      event({ job: 'a', owner: '' }),
      event({ job: 'z', owner: null, at: '2026-10-28T01:00:00-05:30' }),
    ));
    expect(result).toEqual({
      kind: 'found', night, badLines: 0, statusCounts: { ok: 2, retry: 1, fail: 1 },
      rows: [
        {
          job: 'a', owner: '', runs: 1, retries: 0,
          statusCounts: { ok: 1, retry: 0, fail: 0 }, lastStatus: 'ok', lastError: null,
          firstAt: '2026-10-28T23:00:02+01:00', lastAt: '2026-10-28T23:00:02+01:00',
        },
        {
          job: 'z', owner: null, runs: 3, retries: 1,
          statusCounts: { ok: 1, retry: 1, fail: 1 }, lastStatus: 'ok', lastError: 'latest',
          firstAt: '2026-10-29T03:00:00.123+02:00', lastAt: '2026-10-28T01:00:00-05:30',
        },
      ],
    });
  });

  it('keeps the latest empty error string distinct from no error', () => {
    const result = read(jsonl(event({ error: 'old' }), event({ error: '' }), event()));
    expect(result.rows[0].lastError).toBe('');
  });

  it.each([
    ['null', 'null'], ['array', '[]'], ['primitive', '42'], ['truncated JSON', '{"at":'],
    ['missing owner', JSON.stringify(event({ owner: undefined }))],
    ['invalid owner', JSON.stringify(event({ owner: 7 }))],
    ['empty job', JSON.stringify(event({ job: '' }))],
    ['null job', JSON.stringify(event({ job: null }))],
    ['unknown status', JSON.stringify(event({ status: 'running' }))],
    ['invalid error', JSON.stringify(event({ error: null }))],
    ['missing time', JSON.stringify(event({ at: undefined }))],
    ['invalid time', JSON.stringify(event({ at: 'not a time' }))],
    ['missing offset', JSON.stringify(event({ at: '2026-10-28T23:00:00' }))],
    ['invalid date', JSON.stringify(event({ at: '2026-02-30T23:00:00Z' }))],
    ['invalid hour', JSON.stringify(event({ at: '2026-10-28T24:00:00Z' }))],
    ['invalid offset', JSON.stringify(event({ at: '2026-10-28T23:00:00+24:00' }))],
  ])('counts %s once without changing valid rows', (_name, invalid) => {
    const result = read(`${jsonl(event())}\n${invalid}\n${jsonl(event({ status: 'retry' }))}`);
    expect(result.badLines).toBe(1);
    expect(result.statusCounts).toEqual({ ok: 1, retry: 1, fail: 0 });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ runs: 2, retries: 1, lastStatus: 'retry', owner: 'rook' });
  });

  it('ignores blank lines, handles CRLF and a final line without a newline', () => {
    const result = read(`\r\n \t\r\n${jsonl(event())}\r\n${jsonl(event({ at: '2026-10-29T00:00:00Z' }))}`);
    expect(result.badLines).toBe(0);
    expect(result.rows[0]).toMatchObject({ runs: 2, lastAt: '2026-10-29T00:00:00Z' });
  });

  it.each(['', '\n \t\r\n'])('distinguishes an empty night from a missing night (%j)', (contents) => {
    expect(readNight(runsDir, night)).toEqual({ kind: 'missing', night });
    expect(read(contents)).toEqual({
      kind: 'found', night, rows: [], badLines: 0, statusCounts: { ok: 0, retry: 0, fail: 0 },
    });
  });

  it('distinguishes malformed-only input from an empty night', () => {
    expect(read('{broken\nnull\n')).toEqual({
      kind: 'found', night, rows: [], badLines: 2, statusCounts: { ok: 0, retry: 0, fail: 0 },
    });
  });

  it('returns missing for an absent runs directory and propagates other I/O errors', () => {
    expect(readNight(join(runsDir, 'absent'), night)).toEqual({ kind: 'missing', night });
    mkdirSync(join(runsDir, `${night}.jsonl`));
    expect(() => readNight(runsDir, night)).toThrow();
  });

  it.each(['../2026-10-28', '/2026-10-28', '2026-2-01', '2026-02-29', '2026-13-01', ''])
    ('rejects invalid night %j before reading a path', (invalid) => {
      expect(() => readNight(runsDir, invalid)).toThrow(RangeError);
    });

  it('accepts leap days, extra event fields, and job names that are object keys', () => {
    writeFileSync(join(runsDir, '2024-02-29.jsonl'), jsonl(
      event({ job: '__proto__', at: '2024-02-29T01:00:00+00:00', extra: true }),
      event({ job: 'constructor', at: '2024-02-29T02:00:00Z' }),
    ));
    const result = readNight(runsDir, '2024-02-29');
    expect(result.kind === 'found' && result.rows.map((row) => row.job)).toEqual(['__proto__', 'constructor']);
    expect(result.kind === 'found' && result.badLines).toBe(0);
  });
});

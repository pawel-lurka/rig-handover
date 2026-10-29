/** Status of one valid run-log event. */
export type RunStatus = 'ok' | 'retry' | 'fail';

/** Event counts, not counts of jobs grouped by their final status. */
export type StatusCounts = Record<RunStatus, number>;

/** One job, aggregated in file order. Times are copied without changing offsets. */
export type DigestRow = {
  job: string;
  /** Owner from the last valid event; null and the empty string stay distinct. */
  owner: string | null;
  /** All valid events for this job, including retry and fail events. */
  runs: number;
  /** Number of retry events (also available as statusCounts.retry). */
  retries: number;
  /** Counts across all this job's events, so a recovered failure stays visible. */
  statusCounts: StatusCounts;
  lastStatus: RunStatus;
  /** Most recent error string, retained after recovery; null if none was logged. */
  lastError: string | null;
  /** Timestamp of the first valid event for the job in file order. */
  firstAt: string;
  /** Timestamp of the last valid event for the job in file order. */
  lastAt: string;
};

export type NightDigest =
  | { kind: 'missing'; night: string }
  | {
      kind: 'found';
      night: string;
      /** One row per job, sorted by job using code-unit order. */
      rows: DigestRow[];
      /** Nonblank lines with invalid JSON or invalid event fields. */
      badLines: number;
      /** All valid events in the night; the sum equals the sum of row.runs. */
      statusCounts: StatusCounts;
    };

/**
 * readNight(runsDir, night) synchronously reads runsDir/<night>.jsonl.
 *
 * Exported by src/digest/reader.ts. Consumers share this contract, not a parser.
 * A missing file (or directory) returns kind: 'missing'. An existing empty file
 * returns kind: 'found', with no rows, zero bad lines, and zero status counts.
 * A malformed-only file is found too, with no rows and a nonzero badLines count.
 * Blank lines are ignored. Invalid events never change rows or status counts.
 * Input events require an offset-bearing ISO timestamp, a nonempty job, a known
 * status, a string or null owner, and an optional string error.
 * Invalid YYYY-MM-DD night arguments throw RangeError before any file is read;
 * other filesystem failures propagate rather than masquerading as missing data.
 */
export type ReadNight = (runsDir: string, night: string) => NightDigest;

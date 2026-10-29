import type { NightDigest } from '../digest/types.js';

type FoundDigest = Extract<NightDigest, { kind: 'found' }>;

export function DigestPage({ digest }: { digest: FoundDigest }) {
  return (
    <>
      <h1>digest · {digest.night}</h1>
      <p>
        Events: {digest.statusCounts.ok} ok · {digest.statusCounts.retry} retry ·{' '}
        {digest.statusCounts.fail} fail · Bad lines: {digest.badLines}
      </p>
      {digest.rows.length === 0 ? (
        <p>nothing ran</p>
      ) : (
        <div class="digest-table" role="region" aria-label="Job summary" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Job</th>
                <th scope="col">Owner</th>
                <th scope="col">Runs</th>
                <th scope="col">Retries</th>
                <th scope="col">OK</th>
                <th scope="col">Retry</th>
                <th scope="col">Fail</th>
                <th scope="col">Last status</th>
                <th scope="col">Last error</th>
                <th scope="col">First at</th>
                <th scope="col">Last at</th>
              </tr>
            </thead>
            <tbody>
              {digest.rows.map((row) => (
                <tr>
                  <th scope="row" class={row.statusCounts.fail > 0 || row.retries >= 3 ? 'warn' : undefined}>
                    {row.job}
                  </th>
                  <td>{row.owner || '—'}</td>
                  <td>{row.runs}</td>
                  <td class={row.retries >= 3 ? 'warn' : undefined}>
                    {row.retries}{row.retries >= 3 ? ' · high retries' : ''}
                  </td>
                  <td>{row.statusCounts.ok}</td>
                  <td>{row.statusCounts.retry}</td>
                  <td class={row.statusCounts.fail > 0 ? 'warn' : undefined}>
                    {row.statusCounts.fail}{row.statusCounts.fail > 0 ? ' · failed' : ''}
                  </td>
                  <td>{row.lastStatus}</td>
                  <td>{row.lastError || '—'}</td>
                  <td><time dateTime={row.firstAt}>{row.firstAt}</time></td>
                  <td><time dateTime={row.lastAt}>{row.lastAt}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

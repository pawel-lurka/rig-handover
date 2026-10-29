import { Hono } from 'hono';
import { loadConfig, type RigConfig } from './config.js';
import { readNight } from './digest/reader.js';
import { lane } from './lane.js';
import { readStatus } from './status.js';
import { Layout } from './views/layout.js';
import { DigestPage } from './views/digest.js';
import { StatusBoard } from './views/status.js';

export function createApp(config: RigConfig = loadConfig()) {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, lane: lane().id }));

  app.get('/api/digest/:night', (c) => {
    try {
      const digest = readNight(config.runsDir, c.req.param('night'));
      return c.json(digest, digest.kind === 'missing' ? 404 : 200);
    } catch (error) {
      if (error instanceof RangeError) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  });

  app.get('/', (c) =>
    c.html(
      <Layout title="status" lane={lane()}>
        <StatusBoard status={readStatus(config)} />
      </Layout>,
    ),
  );

  app.get('/digest/:night', (c) => {
    const night = c.req.param('night');
    try {
      const digest = readNight(config.runsDir, night);
      if (digest.kind === 'missing') {
        return c.html(
          <Layout title={`digest · ${night}`} lane={lane()}>
            <h1>digest · {night}</h1>
            <p>night not found</p>
          </Layout>,
          404,
        );
      }
      return c.html(
        <Layout title={`digest · ${night}`} lane={lane()}>
          <DigestPage digest={digest} />
        </Layout>,
      );
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return c.html(
        <Layout title="digest" lane={lane()}>
          <h1>digest</h1>
          <p>night must be a valid YYYY-MM-DD date</p>
        </Layout>,
        400,
      );
    }
  });

  return app;
}

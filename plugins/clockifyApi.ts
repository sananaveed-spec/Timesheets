import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';
import { loadEnv } from 'vite';
import { fetchDetailedRowsForRange } from '../server/clockify';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function createHandler(env: Record<string, string>): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== '/api/clockify/detailed') {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    try {
      const body = (await readJsonBody(req)) as {
        startDate?: string;
        endDate?: string;
      };
      const startDate = body.startDate?.trim() ?? '';
      const endDate = body.endDate?.trim() ?? '';

      if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
        sendJson(res, 400, {
          error: 'startDate and endDate must be YYYY-MM-DD.',
        });
        return;
      }

      if (startDate > endDate) {
        sendJson(res, 400, {
          error: 'startDate must be on or before endDate.',
        });
        return;
      }

      const rows = await fetchDetailedRowsForRange(env, startDate, endDate);
      sendJson(res, 200, { rows, count: rows.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Clockify request failed.';
      sendJson(res, 500, { error: message });
    }
  };
}

export function clockifyApiPlugin(): Plugin {
  return {
    name: 'clockify-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      server.middlewares.use(createHandler(env));
    },
    configurePreviewServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      server.middlewares.use(createHandler(env));
    },
  };
}

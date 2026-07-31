import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchDetailedRowsForRange } from '../_lib/clockify.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function readEnv(): Record<string, string> {
  return {
    CLOCKIFY_API_KEY: process.env.CLOCKIFY_API_KEY ?? '',
    CLOCKIFY_WORKSPACE_ID: process.env.CLOCKIFY_WORKSPACE_ID ?? '',
    CLOCKIFY_WORKSPACE_TIMEZONE: process.env.CLOCKIFY_WORKSPACE_TIMEZONE ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as { startDate?: string; endDate?: string })
        : ((req.body ?? {}) as { startDate?: string; endDate?: string });

    const startDate = body.startDate?.trim() ?? '';
    const endDate = body.endDate?.trim() ?? '';

    if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      res.status(400).json({
        error: 'startDate and endDate must be YYYY-MM-DD.',
      });
      return;
    }

    if (startDate > endDate) {
      res.status(400).json({
        error: 'startDate must be on or before endDate.',
      });
      return;
    }

    const rows = await fetchDetailedRowsForRange(readEnv(), startDate, endDate);
    res.status(200).json({ rows, count: rows.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Clockify request failed.';
    res.status(500).json({ error: message });
  }
}

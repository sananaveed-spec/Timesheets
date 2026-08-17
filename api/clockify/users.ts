import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchActiveUsersFromEnv } from '../_lib/clockify.js';

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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const users = await fetchActiveUsersFromEnv(readEnv());
    res.status(200).json({ users, count: users.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Clockify request failed.';
    res.status(500).json({ error: message });
  }
}

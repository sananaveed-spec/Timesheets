import type { ClockifyRow } from '../types';

export type ClockifyFetchResult =
  | { success: true; data: ClockifyRow[]; label: string }
  | { success: false; error: string };

export async function fetchClockifyDetailedRange(
  startDate: string,
  endDate: string,
): Promise<ClockifyFetchResult> {
  try {
    const response = await fetch('/api/clockify/detailed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });

    const payload = (await response.json()) as {
      rows?: ClockifyRow[];
      count?: number;
      error?: string;
    };

    if (!response.ok) {
      return {
        success: false,
        error: payload.error || `Clockify fetch failed (${response.status}).`,
      };
    }

    const rows = payload.rows ?? [];
    if (rows.length === 0) {
      return {
        success: false,
        error: 'No time entries found for the selected date range.',
      };
    }

    return {
      success: true,
      data: rows,
      label: `Clockify ${startDate} to ${endDate}`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to reach Clockify API proxy.',
    };
  }
}

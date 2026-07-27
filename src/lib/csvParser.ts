import Papa from 'papaparse';
import type { ClockifyRow } from '../types';

const REQUIRED_COLUMNS = ['User', 'Project', 'Tags', 'Description', 'Start Date', 'Duration (decimal)'] as const;

export type ParseResult =
  | { success: true; data: ClockifyRow[] }
  | { success: false; error: string };

export function parseClockifyCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<ClockifyRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const firstError = results.errors[0];
          resolve({
            success: false,
            error: `CSV parse error: ${firstError.message} (row ${firstError.row})`,
          });
          return;
        }

        const data = results.data;
        if (!data || data.length === 0) {
          resolve({ success: false, error: 'CSV file is empty' });
          return;
        }

        const headers = Object.keys(data[0] || {});
        for (const col of REQUIRED_COLUMNS) {
          if (!headers.includes(col)) {
            resolve({
              success: false,
              error: `Missing required column: "${col}". Found columns: ${headers.join(', ')}`,
            });
            return;
          }
        }

        const typedData = data as ClockifyRow[];
        resolve({ success: true, data: typedData });
      },
    });
  });
}

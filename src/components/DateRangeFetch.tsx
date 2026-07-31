import { useCallback, useMemo, useState } from 'react';

interface DateRangeFetchProps {
  onFetch: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

export function DateRangeFetch({ onFetch, disabled }: DateRangeFetchProps) {
  const [startDate, setStartDate] = useState(firstOfMonthIso);
  const [endDate, setEndDate] = useState(todayIso);

  const canSubmit = useMemo(() => {
    if (!startDate || !endDate) return false;
    return startDate <= endDate;
  }, [startDate, endDate]);

  const handleNext = useCallback(() => {
    if (!canSubmit || disabled) return;
    onFetch(startDate, endDate);
  }, [canSubmit, disabled, onFetch, startDate, endDate]);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5">
      <p className="mb-4 text-sm font-medium text-gray-800">
        Select a date range to pull Clockify Detailed View entries
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Start date
          <input
            type="date"
            id="start-date"
            value={startDate}
            max={endDate || undefined}
            disabled={disabled}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm disabled:bg-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          End date
          <input
            type="date"
            id="end-date"
            value={endDate}
            min={startDate || undefined}
            disabled={disabled}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm disabled:bg-gray-100"
          />
        </label>
        <button
          type="button"
          onClick={handleNext}
          disabled={disabled || !canSubmit}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Next
        </button>
      </div>
      {!canSubmit && startDate && endDate && startDate > endDate && (
        <p className="mt-3 text-xs text-red-600">
          Start date must be on or before end date.
        </p>
      )}
    </div>
  );
}

import type { PivotData } from '../types';

interface PivotPreviewProps {
  pivot: PivotData;
}

export function PivotPreview({ pivot }: PivotPreviewProps) {
  return (
    <div className="mt-6 overflow-auto rounded-lg border border-gray-200 bg-white">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                Row Labels
              </th>
              {pivot.dateLabels.map((label) => (
                <th
                  key={label}
                  className="border border-gray-300 px-2 py-2 text-right font-semibold"
                >
                  {label}
                </th>
              ))}
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                Grand Total
              </th>
            </tr>
          </thead>
          <tbody>
            {pivot.rows.map((row, i) => (
              <tr
                key={i}
                className={
                  row.isEmployeeTotal
                    ? 'bg-blue-50 font-medium'
                    : 'hover:bg-gray-50'
                }
              >
                <td
                  className="border border-gray-300 px-3 py-1.5 text-left"
                  style={{ paddingLeft: `${12 + row.indentLevel * 16}px` }}
                >
                  {row.label}
                </td>
                {pivot.dates.map((d) => {
                  const v = row.dateValues[d];
                  const display =
                    v !== undefined && v !== 0
                      ? Number.isInteger(v)
                        ? String(v)
                        : v.toFixed(2)
                      : '';
                  return (
                    <td
                      key={d}
                      className="border border-gray-300 px-2 py-1.5 text-right"
                    >
                      {display}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-3 py-1.5 text-right font-medium">
                  {row.grandTotal !== 0
                    ? Number.isInteger(row.grandTotal)
                      ? row.grandTotal
                      : row.grandTotal.toFixed(2)
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

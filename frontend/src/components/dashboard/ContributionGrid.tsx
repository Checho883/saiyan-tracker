import type { ContributionDay } from '../../types';

interface ContributionGridProps {
  days: ContributionDay[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * GitHub-style 90-day contribution grid.
 * 7 rows (days of week) x ~13 columns (weeks).
 * Most recent week on the right.
 */
export function ContributionGrid({ days }: ContributionGridProps) {
  if (days.length === 0) {
    return (
      <div className="text-text-muted text-sm text-center py-4">
        No completion data yet
      </div>
    );
  }

  // Sort days chronologically
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // Build a map for quick lookup
  const dayMap = new Map(sorted.map((d) => [d.date, d]));

  // Determine the date range: from first day to last day
  const firstDate = new Date(sorted[0].date + 'T00:00:00');
  const lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00');

  // Pad to start on Sunday of the first week
  const startDow = firstDate.getDay(); // 0=Sun
  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - startDow);

  // Pad to end on Saturday of the last week
  const endDow = lastDate.getDay();
  const gridEnd = new Date(lastDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - endDow));

  // Generate all cells
  const cells: { date: string; completed: boolean | null }[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const day = dayMap.get(dateStr);
    cells.push({
      date: dateStr,
      completed: day ? day.completed : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Number of weeks (columns)
  const weeks = Math.ceil(cells.length / 7);

  return (
    <div className="flex gap-1">
      {/* Day-of-week labels */}
      <div className="flex flex-col gap-1 mr-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={`label-${i}`}
            className="w-3 h-3 flex items-center justify-center text-text-muted"
            style={{ fontSize: '8px' }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid columns (weeks) */}
      {Array.from({ length: weeks }, (_, weekIdx) => (
        <div key={`week-${weekIdx}`} className="flex flex-col gap-1">
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const cellIdx = weekIdx * 7 + dayIdx;
            const cell = cells[cellIdx];
            if (!cell) {
              return <div key={`empty-${dayIdx}`} className="w-3 h-3" />;
            }
            const isCompleted = cell.completed === true;
            const isInRange = cell.completed !== null;
            return (
              <div
                key={cell.date}
                data-testid="contribution-cell"
                className={`w-3 h-3 rounded-sm ${
                  isCompleted
                    ? 'bg-green-500'
                    : isInRange
                      ? 'bg-space-700'
                      : 'bg-transparent'
                }`}
                title={
                  isInRange
                    ? `${cell.date}: ${isCompleted ? 'Completed' : 'Missed'}`
                    : undefined
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface ProgressRingProps {
  percentage: number; // 0 to 1 (e.g., 0.85 = 85%)
  size?: number; // px, default 72
  strokeWidth?: number; // px, default 5
  color: string; // CSS color value, e.g. "var(--color-attr-str)"
  label: string; // Display label below, e.g. "7-day" or "30-day"
}

export function ProgressRing({
  percentage,
  size = 72,
  strokeWidth = 5,
  color,
  label,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - clamped * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-space-600)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage text centered over SVG */}
        <span
          className="absolute inset-0 flex items-center justify-center text-text-primary font-bold text-sm"
          aria-label={`${Math.round(clamped * 100)} percent`}
        >
          {Math.round(clamped * 100)}%
        </span>
      </div>
      <span className="text-text-muted text-xs">{label}</span>
    </div>
  );
}

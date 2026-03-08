import type { AuraTier } from '../../hooks/useAuraProgress';

const strokeColorMap: Record<AuraTier, string> = {
  base: 'var(--color-saiyan-500)',
  kaioken_x3: 'var(--color-saiyan-500)',
  kaioken_x10: 'var(--color-aura-500)',
  kaioken_x20: 'var(--color-success)',
};

const tierLabelMap: Record<AuraTier, string> = {
  base: '',
  kaioken_x3: 'Kaio-ken x3',
  kaioken_x10: 'Kaio-ken x10',
  kaioken_x20: 'Kaio-ken x20',
};

interface AuraGaugeProps {
  percent: number;
  tier: AuraTier;
  size?: number;
  hideText?: boolean;
}

export function AuraGauge({ percent, tier, size = 140, hideText = false }: AuraGaugeProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block"
    >
      {/* Track circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-space-700)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        data-testid="aura-progress"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColorMap[tier]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 700ms ease-out',
          transform: 'rotate(-90deg)',
          transformOrigin: `${center}px ${center}px`,
        }}
      />
      {/* Center text (hidden when used as compact gauge) */}
      {!hideText && (
        <>
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--color-text-primary)"
            fontSize="22"
            fontWeight="bold"
          >
            {percent}%
          </text>
          {tierLabelMap[tier] && (
            <text
              x={center}
              y={center + 18}
              textAnchor="middle"
              dominantBaseline="central"
              fill={strokeColorMap[tier]}
              fontSize="10"
              fontWeight="600"
            >
              {tierLabelMap[tier]}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

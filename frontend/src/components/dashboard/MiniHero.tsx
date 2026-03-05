import { usePowerStore } from '../../store/powerStore';
import { useAuraProgress } from '../../hooks/useAuraProgress';
import type { AuraTier } from '../../hooks/useAuraProgress';

const barColorMap: Record<AuraTier, string> = {
  base: 'bg-saiyan-500',
  kaioken_x3: 'bg-saiyan-500',
  kaioken_x10: 'bg-aura-500',
  kaioken_x20: 'bg-success',
};

const tierLabelMap: Record<AuraTier, string> = {
  base: '',
  kaioken_x3: 'Kaio-ken x3',
  kaioken_x10: 'Kaio-ken x10',
  kaioken_x20: 'Kaio-ken x20',
};

export function MiniHero() {
  const powerLevel = usePowerStore((s) => s.powerLevel);
  const { percent, tier } = useAuraProgress();

  return (
    <div className="h-12 bg-space-800 border-b border-space-700 flex items-center gap-3 px-4">
      {/* Linear progress bar */}
      <div className="flex-1 h-1.5 bg-space-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColorMap[tier]}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Power level */}
      <span className="text-sm font-mono font-bold text-saiyan-500">
        {powerLevel.toLocaleString()}
      </span>

      {/* Tier label */}
      {tierLabelMap[tier] && (
        <span className="text-xs text-text-secondary">{tierLabelMap[tier]}</span>
      )}
    </div>
  );
}

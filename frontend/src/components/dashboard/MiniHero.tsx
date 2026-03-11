import toast from 'react-hot-toast';
import { ClipboardCopy } from 'lucide-react';
import { usePowerStore } from '../../store/powerStore';
import { useAuraProgress } from '../../hooks/useAuraProgress';
import type { AuraTier } from '../../hooks/useAuraProgress';
import { buildDailySummary } from '../../utils/shareSummary';

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

  async function handleShare() {
    const summary = buildDailySummary();
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Scouter data copied!', { duration: 2000, position: 'top-center' });
    } catch {
      toast.error('Copy failed — try again', { duration: 2000, position: 'top-center' });
    }
  }

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

      {/* Share button */}
      <button
        onClick={handleShare}
        className="p-1 rounded hover:bg-space-700 transition-colors flex-shrink-0"
        aria-label="Share daily summary"
      >
        <ClipboardCopy className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {/* Tier label */}
      {tierLabelMap[tier] && (
        <span className="text-xs text-text-secondary">{tierLabelMap[tier]}</span>
      )}
    </div>
  );
}

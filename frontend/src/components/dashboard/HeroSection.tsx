import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import toast from 'react-hot-toast';
import { ClipboardCopy } from 'lucide-react';
import { usePowerStore } from '../../store/powerStore';
import { useRewardStore } from '../../store/rewardStore';
import { useUiStore } from '../../store/uiStore';
import { useAuraProgress } from '../../hooks/useAuraProgress';
import type { AuraTier } from '../../hooks/useAuraProgress';
import { SaiyanAvatar } from './SaiyanAvatar';
import { AuraGauge } from './AuraGauge';
import { ScouterHUD } from './ScouterHUD';
import { TierChangeBanner } from '../animations/TierChangeBanner';
import { buildDailySummary } from '../../utils/shareSummary';

const progressColorMap: Record<AuraTier, string> = {
  base: 'var(--color-saiyan-500)',
  kaioken_x3: 'var(--color-saiyan-500)',
  kaioken_x10: 'var(--color-aura-500)',
  kaioken_x20: 'var(--color-success)',
};

export function HeroSection() {
  const { powerLevel, transformation, transformationName, nextTransformation, nextThreshold } =
    usePowerStore(
      useShallow((s) => ({
        powerLevel: s.powerLevel,
        transformation: s.transformation,
        transformationName: s.transformationName,
        nextTransformation: s.nextTransformation,
        nextThreshold: s.nextThreshold,
      }))
    );

  const displayName = useRewardStore((s) => s.settings?.display_name);

  const { percent, tier } = useAuraProgress();

  // Inline tier change banner: find tier_change event in queue
  const animationQueue = useUiStore((s) => s.animationQueue);
  const dequeueAnimation = useUiStore((s) => s.dequeueAnimation);
  const tierEvent = animationQueue.find((e) => e.type === 'tier_change');

  const handleShare = useCallback(async () => {
    const summary = buildDailySummary();
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Scouter data copied!', { duration: 2000, position: 'top-center' });
    } catch {
      toast.error('Copy failed — try again', { duration: 2000, position: 'top-center' });
    }
  }, []);

  const handleTierDismiss = useCallback(() => {
    // Dequeue the tier_change event after banner auto-dismisses
    if (tierEvent) {
      dequeueAnimation();
    }
  }, [tierEvent, dequeueAnimation]);

  return (
    <>
      {/* === COMPACT HERO (mobile < 768px) === */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-space-800 to-transparent">
        {/* Small avatar + gauge */}
        <div className="relative flex-shrink-0">
          <AuraGauge percent={percent} tier={tier} size={48} hideText />
          <div className="absolute inset-0 flex items-center justify-center">
            <SaiyanAvatar transformation={transformation} className="w-6 h-6" />
          </div>
        </div>

        {/* Power info inline */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-saiyan-500">
              {powerLevel.toLocaleString()}
            </span>
            <span className="text-xs text-text-secondary truncate">
              {transformationName}
            </span>
          </div>
          {/* Inline aura progress bar */}
          <div className="h-1.5 bg-space-700 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: progressColorMap[tier],
              }}
            />
          </div>
        </div>

        {/* Display name (if set) */}
        {displayName && (
          <span className="text-sm font-bold text-text-primary truncate max-w-[80px]">
            {displayName}
          </span>
        )}

        {/* Share button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          className="p-1.5 rounded-lg hover:bg-space-700 transition-colors flex-shrink-0"
          aria-label="Share daily summary"
        >
          <ClipboardCopy className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* === FULL HERO (desktop md+) === */}
      <div className="hidden md:flex flex-col items-center gap-4 px-4 py-6 bg-gradient-to-b from-space-800 to-transparent">
        {/* Avatar with aura gauge overlaid */}
        <div className="relative">
          <AuraGauge percent={percent} tier={tier} size={160} />
          <div className="absolute inset-0 flex items-center justify-center">
            <SaiyanAvatar transformation={transformation} className="w-20 h-20" />
          </div>

          {/* Inline tier change banner (ANIM-02) */}
          {tierEvent && tierEvent.type === 'tier_change' && (
            <TierChangeBanner tier={tierEvent.tier} onDismiss={handleTierDismiss} />
          )}
        </div>

        {/* Display name plate */}
        {displayName && (
          <div className="bg-space-700/50 rounded-lg px-3 py-1">
            <span className="text-lg font-bold text-text-primary">{displayName}</span>
          </div>
        )}

        {/* Scouter HUD below */}
        <ScouterHUD
          powerLevel={powerLevel}
          transformationName={transformationName}
          nextTransformation={nextTransformation}
          nextThreshold={nextThreshold}
          onShare={handleShare}
        />
      </div>

      {/* Tier change banner for mobile — render below compact hero */}
      {tierEvent && tierEvent.type === 'tier_change' && (
        <div className="md:hidden">
          <TierChangeBanner tier={tierEvent.tier} onDismiss={handleTierDismiss} />
        </div>
      )}
    </>
  );
}

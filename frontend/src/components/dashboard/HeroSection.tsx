import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePowerStore } from '../../store/powerStore';
import { useUiStore } from '../../store/uiStore';
import { useAuraProgress } from '../../hooks/useAuraProgress';
import { SaiyanAvatar } from './SaiyanAvatar';
import { AuraGauge } from './AuraGauge';
import { ScouterHUD } from './ScouterHUD';
import { TierChangeBanner } from '../animations/TierChangeBanner';

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

  const { percent, tier } = useAuraProgress();

  // Inline tier change banner: find tier_change event in queue
  const animationQueue = useUiStore((s) => s.animationQueue);
  const dequeueAnimation = useUiStore((s) => s.dequeueAnimation);
  const tierEvent = animationQueue.find((e) => e.type === 'tier_change');

  const handleTierDismiss = useCallback(() => {
    // Dequeue the tier_change event after banner auto-dismisses
    if (tierEvent) {
      dequeueAnimation();
    }
  }, [tierEvent, dequeueAnimation]);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 bg-gradient-to-b from-space-800 to-transparent">
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

      {/* Scouter HUD below */}
      <ScouterHUD
        powerLevel={powerLevel}
        transformationName={transformationName}
        nextTransformation={nextTransformation}
        nextThreshold={nextThreshold}
      />
    </div>
  );
}

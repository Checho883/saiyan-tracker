import { useShallow } from 'zustand/react/shallow';
import { usePowerStore } from '../../store/powerStore';
import { useAuraProgress } from '../../hooks/useAuraProgress';
import { SaiyanAvatar } from './SaiyanAvatar';
import { AuraGauge } from './AuraGauge';
import { ScouterHUD } from './ScouterHUD';

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

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 bg-gradient-to-b from-space-800 to-transparent">
      {/* Avatar with aura gauge overlaid */}
      <div className="relative">
        <AuraGauge percent={percent} tier={tier} size={160} />
        <div className="absolute inset-0 flex items-center justify-center">
          <SaiyanAvatar transformation={transformation} className="w-20 h-20" />
        </div>
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

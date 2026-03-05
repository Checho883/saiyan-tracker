import { useState } from 'react';
import { User } from 'lucide-react';

interface SaiyanAvatarProps {
  transformation: string;
  className?: string;
}

const glowColorMap: Record<string, string> = {
  base: '0 0 20px var(--color-saiyan-500)',
  ssj: '0 0 20px var(--color-saiyan-500)',
  ssj2: '0 0 24px var(--color-saiyan-500)',
  ssj3: '0 0 28px var(--color-saiyan-500)',
  ssg: '0 0 24px var(--color-danger)',
  ssb: '0 0 24px var(--color-aura-500)',
  ui: '0 0 28px #c0c0c0',
};

export function SaiyanAvatar({ transformation, className = '' }: SaiyanAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const glow = glowColorMap[transformation] ?? glowColorMap.base;

  if (imgError && fallbackError) {
    return (
      <div
        className={`rounded-full border-2 border-space-600 bg-gradient-to-br from-space-700 to-space-800 flex items-center justify-center ${className}`}
        style={{ boxShadow: glow, width: 96, height: 96 }}
      >
        <User className="w-10 h-10 text-text-muted" />
      </div>
    );
  }

  return (
    <img
      role="img"
      src={imgError ? '/assets/avatars/base.webp' : `/assets/avatars/${transformation}.webp`}
      alt={`Saiyan ${transformation}`}
      className={`rounded-full border-2 border-space-600 object-cover ${className}`}
      style={{ boxShadow: glow, width: 96, height: 96 }}
      onError={() => {
        if (imgError) {
          setFallbackError(true);
        } else {
          setImgError(true);
        }
      }}
    />
  );
}

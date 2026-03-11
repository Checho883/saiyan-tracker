import { useEffect } from 'react';
import type { Attribute } from '../../types';

const textColorMap: Record<Attribute, string> = {
  str: 'text-attr-str',
  vit: 'text-attr-vit',
  int: 'text-attr-int',
  ki: 'text-attr-ki',
};

interface XpPopupProps {
  amount: number;
  attribute: Attribute;
  onDone: () => void;
  negative?: boolean;
}

export function XpPopup({ amount, attribute, onDone, negative = false }: XpPopupProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const colorClass = negative ? 'text-danger' : textColorMap[attribute];
  const positionClass = negative ? '-bottom-2' : '-top-2';
  const animation = negative ? 'xp-sink 1s ease-out forwards' : 'xp-float 1s ease-out forwards';
  const prefix = negative ? '-' : '+';

  return (
    <span
      className={`absolute ${positionClass} right-4 text-sm font-bold pointer-events-none ${colorClass}`}
      style={{ animation }}
    >
      {prefix}{amount} {attribute.toUpperCase()} XP
    </span>
  );
}

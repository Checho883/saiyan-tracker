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
}

export function XpPopup({ amount, attribute, onDone }: XpPopupProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <span
      className={`absolute -top-2 right-4 text-sm font-bold pointer-events-none ${textColorMap[attribute]}`}
      style={{ animation: 'xp-float 1s ease-out forwards' }}
    >
      +{amount} {attribute.toUpperCase()} XP
    </span>
  );
}

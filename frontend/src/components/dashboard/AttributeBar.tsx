import { Swords, Heart, Brain, Flame } from 'lucide-react';
import type { AttributeDetail, Attribute } from '../../types';

const iconMap: Record<Attribute, React.ComponentType<{ className?: string }>> = {
  str: Swords,
  vit: Heart,
  int: Brain,
  ki: Flame,
};

const bgColorMap: Record<Attribute, string> = {
  str: 'bg-attr-str',
  vit: 'bg-attr-vit',
  int: 'bg-attr-int',
  ki: 'bg-attr-ki',
};

const textColorMap: Record<Attribute, string> = {
  str: 'text-attr-str',
  vit: 'text-attr-vit',
  int: 'text-attr-int',
  ki: 'text-attr-ki',
};

const iconColorMap: Record<Attribute, string> = {
  str: 'text-attr-str',
  vit: 'text-attr-vit',
  int: 'text-attr-int',
  ki: 'text-attr-ki',
};

interface AttributeBarProps {
  detail: AttributeDetail;
}

export function AttributeBar({ detail }: AttributeBarProps) {
  const Icon = iconMap[detail.attribute];

  return (
    <div className="bg-space-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColorMap[detail.attribute]}`} />
        <span className="text-xs font-semibold uppercase text-text-secondary">
          {detail.attribute}
        </span>
        <span className={`ml-auto text-lg font-bold ${textColorMap[detail.attribute]}`}>
          {detail.level}
        </span>
      </div>

      {/* XP progress bar */}
      <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bgColorMap[detail.attribute]}`}
          style={{ width: `${detail.progress_percent}%` }}
        />
      </div>

      <p className="text-text-muted text-xs mt-1">
        {detail.xp_for_current_level} / {detail.xp_for_next_level} XP
      </p>
    </div>
  );
}

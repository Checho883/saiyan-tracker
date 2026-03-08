import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  count,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(() => {
    // On mobile (< 768px), override to collapsed unless explicitly opened
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    return defaultOpen;
  });

  return (
    <div className="border border-space-600 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-space-700/50 hover:bg-space-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-saiyan-500" />
          <span className="font-semibold text-text-primary">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-space-600 text-text-secondary rounded-full px-2 py-0.5">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isOpen ? '2000px' : '0px' }}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

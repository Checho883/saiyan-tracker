import { ClipboardCopy } from 'lucide-react';

interface ScouterHUDProps {
  powerLevel: number;
  transformationName: string;
  nextTransformation: string | null;
  nextThreshold: number | null;
  onShare?: () => void;
}

export function ScouterHUD({
  powerLevel,
  transformationName,
  nextTransformation,
  nextThreshold,
  onShare,
}: ScouterHUDProps) {
  const progressPercent =
    nextThreshold && nextThreshold > 0
      ? Math.min((powerLevel / nextThreshold) * 100, 100)
      : 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-mono font-bold text-saiyan-500">
          {powerLevel.toLocaleString()}
        </span>
        {onShare && (
          <button
            onClick={onShare}
            className="p-1.5 rounded-lg hover:bg-space-700 transition-colors"
            aria-label="Share daily summary"
          >
            <ClipboardCopy className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>
      <span className="text-sm text-text-secondary">{transformationName}</span>

      {nextThreshold != null && (
        <>
          <div className="w-32 h-1.5 bg-space-700 rounded-full mt-1 overflow-hidden">
            <div
              data-testid="next-form-progress"
              className="h-full bg-aura-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-text-muted">
            {nextTransformation ? `Next: ${nextTransformation}` : 'MAX POWER'}
          </span>
        </>
      )}
      {nextThreshold == null && (
        <span className="text-xs text-text-muted mt-1">MAX POWER</span>
      )}
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useStatusStore } from '../../store/statusStore';
import { ScreenShake } from '../animations/ScreenShake';

/**
 * Inline dismissible card showing Goku welcome-back quote and/or Vegeta roast.
 * Renders at top of Dashboard when StatusResponse contains data.
 * Severity-based visual escalation: mild (yellow), medium (orange+pulse), savage (red+shake).
 */
export function RoastWelcomeCard() {
  const status = useStatusStore((s) => s.status);
  const isLoaded = useStatusStore((s) => s.isLoaded);
  const [dismissed, setDismissed] = useState(false);

  if (!isLoaded || !status || (!status.welcome_back && !status.roast)) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  const severity = status.roast?.severity ?? 'mild';

  const severityStyles: Record<string, string> = {
    mild: 'border-yellow-500/30 bg-space-800',
    medium: 'border-orange-500/50 bg-space-800 animate-pulse',
    savage: 'border-red-500/70 bg-red-950/30',
  };

  const cardStyle = severityStyles[severity] ?? severityStyles.mild;

  const cardContent = (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className={`mx-4 mt-2 mb-2 rounded-xl border p-4 relative ${cardStyle}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0, padding: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="roast-welcome-card"
          data-severity={severity}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Goku welcome-back */}
          {status.welcome_back && (
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-space-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                {status.welcome_back.avatar_path ? (
                  <img
                    src={status.welcome_back.avatar_path}
                    alt={status.welcome_back.character}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '🟠'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-text-secondary text-xs font-medium">
                  {status.welcome_back.character}
                </p>
                <p className="text-text-primary text-sm mt-0.5">
                  {status.welcome_back.quote_text}
                </p>
              </div>
            </div>
          )}

          {/* Vegeta roast */}
          {status.roast?.quote && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-space-700 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                {status.roast.quote.avatar_path ? (
                  <img
                    src={status.roast.quote.avatar_path}
                    alt={status.roast.quote.character}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '🔵'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-text-secondary text-xs font-medium">
                  {status.roast.quote.character}
                </p>
                <p className="text-text-primary text-sm mt-0.5">
                  {status.roast.quote.quote_text}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  You&apos;ve been gone {status.roast.gap_days} day
                  {status.roast.gap_days !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Wrap in ScreenShake for savage severity
  if (severity === 'savage') {
    return <ScreenShake trigger={true}>{cardContent}</ScreenShake>;
  }

  return cardContent;
}

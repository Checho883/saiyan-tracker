import toast from 'react-hot-toast';
import { User } from 'lucide-react';
import type { QuoteDetail } from '../../types';

export function showCharacterQuote(quote: QuoteDetail) {
  toast.custom(
    (t) => (
      <div
        className={`bg-space-700 border border-space-600 rounded-lg px-4 py-3 shadow-lg max-w-sm flex items-start gap-3 ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
      >
        <img
          src={quote.avatar_path}
          alt={quote.character}
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          onError={(e) => {
            // Replace with fallback icon
            const target = e.currentTarget;
            target.style.display = 'none';
            target.parentElement?.querySelector('[data-fallback]')?.removeAttribute('hidden');
          }}
        />
        <div
          data-fallback
          hidden
          className="w-10 h-10 rounded-full flex-shrink-0 bg-space-600 flex items-center justify-center"
        >
          <User className="w-5 h-5 text-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm italic leading-snug">
            &ldquo;{quote.quote_text}&rdquo;
          </p>
          <p className="text-text-muted text-xs mt-1">
            &mdash; {quote.character}
          </p>
        </div>
      </div>
    ),
    { duration: 3500, position: 'top-center' }
  );
}

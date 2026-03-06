import { useState, useEffect } from 'react';
import type { WishHistoryItem } from '../../types';
import { analyticsApi } from '../../services/api';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function WishHistoryList() {
  const [items, setItems] = useState<WishHistoryItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .wishHistory()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = showAll ? items : items.slice(0, 10);

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <h3 className="text-base font-semibold text-text-primary mb-3">Wish History</h3>

      {loaded && items.length === 0 && (
        <p className="text-text-muted text-sm text-center py-4">No wishes granted yet</p>
      )}

      <div className="space-y-2">
        {visible.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-space-700 rounded-lg px-3 py-2"
          >
            <span className="text-base">🐉</span>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {item.wish_title}
              </p>
            </div>
            <span className="text-text-muted text-xs flex-shrink-0">
              {formatDate(item.granted_at)}
            </span>
          </div>
        ))}
      </div>

      {!showAll && items.length > 10 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 text-saiyan-500 text-sm font-medium hover:text-saiyan-400 transition-colors"
        >
          Show more
        </button>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { CapsuleHistoryItem, Rarity } from '../../types';
import { analyticsApi } from '../../services/api';

const rarityColorMap: Record<Rarity, string> = {
  common: 'bg-gray-500 text-white',
  rare: 'bg-blue-500 text-white',
  epic: 'bg-purple-500 text-white',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CapsuleHistoryList() {
  const [items, setItems] = useState<CapsuleHistoryItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .capsuleHistory()
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
      <h3 className="text-base font-semibold text-text-primary mb-3">Capsule History</h3>

      {loaded && items.length === 0 && (
        <p className="text-text-muted text-sm text-center py-4">No capsule drops yet</p>
      )}

      <div className="space-y-2">
        {visible.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-space-700 rounded-lg px-3 py-2"
          >
            <span
              className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${rarityColorMap[item.reward_rarity]}`}
            >
              {item.reward_rarity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {item.reward_title}
              </p>
              <p className="text-text-muted text-xs truncate">{item.habit_title}</p>
            </div>
            <span className="text-text-muted text-xs flex-shrink-0">
              {formatDate(item.dropped_at)}
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

import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { HabitTodayResponse, Attribute } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { useUiStore } from '../../store/uiStore';
import { useAudio } from '../../audio/useAudio';
import { XpPopup } from './XpPopup';
import { showCharacterQuote } from './CharacterQuote';

const borderColorMap: Record<Attribute, string> = {
  str: 'border-l-attr-str',
  vit: 'border-l-attr-vit',
  int: 'border-l-attr-int',
  ki: 'border-l-attr-ki',
};

const badgeColorMap: Record<Attribute, string> = {
  str: 'text-attr-str bg-attr-str/10',
  vit: 'text-attr-vit bg-attr-vit/10',
  int: 'text-attr-int bg-attr-int/10',
  ki: 'text-attr-ki bg-attr-ki/10',
};

const importanceDotMap: Record<string, string> = {
  critical: 'bg-danger',
  important: 'bg-warning',
  normal: 'bg-text-muted',
};

interface HabitCardProps {
  habit: HabitTodayResponse;
}

export function HabitCard({ habit }: HabitCardProps) {
  const checkHabit = useHabitStore((s) => s.checkHabit);
  const openModal = useUiStore((s) => s.openModal);
  const { play } = useAudio();
  const [showXp, setShowXp] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleTap = useCallback(async () => {
    if (showMenu) return; // Don't trigger check when menu is open
    try {
      const today = new Date().toISOString().slice(0, 10);
      const result = await checkHabit(habit.id, today);

      // Play undo sound when unchecking (check sound handled by useSoundEffect via xp_popup event)
      if (!result.is_checking) {
        play('undo');
      }

      if (result.is_checking && result.attribute_xp_awarded > 0) {
        setXpAmount(result.attribute_xp_awarded);
        setShowXp(true);
      }

      if (result.quote) {
        showCharacterQuote(result.quote);
      }
    } catch {
      // Error handled by store
    }
  }, [checkHabit, habit.id, showMenu, play]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTap();
        }
      }}
      className={`relative bg-space-700 rounded-lg p-3 border-l-4 ${borderColorMap[habit.attribute]} cursor-pointer transition-opacity ${
        habit.completed ? 'opacity-50' : ''
      }`}
    >
      {/* Top row: emoji + title + check indicator + menu */}
      <div className="flex items-center gap-2">
        <span className="text-base">{habit.icon_emoji}</span>
        <span className="text-text-primary text-sm font-medium flex-1 truncate">
          {habit.title}
        </span>
        {habit.completed && (
          <Check className="w-4 h-4 text-success flex-shrink-0" />
        )}

        {/* More options menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-space-600 transition-colors"
            aria-label="Habit options"
          >
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-space-800 border border-space-600 rounded-lg shadow-xl z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(`habit-edit-${habit.id}`);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-space-700 rounded-t-lg"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(`habit-delete-${habit.id}`);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-space-700 rounded-b-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: attribute badge + streak + importance */}
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${badgeColorMap[habit.attribute]}`}
        >
          {habit.attribute}
        </span>

        {habit.streak_current > 0 && (
          <span className="text-xs text-text-secondary">
            🔥 {habit.streak_current}
            {habit.streak_best > 0 && (
              <span className="text-text-muted"> / {habit.streak_best}</span>
            )}
          </span>
        )}

        <span className="ml-auto flex-shrink-0">
          <span
            className={`inline-block w-2 h-2 rounded-full ${importanceDotMap[habit.importance]}`}
          />
        </span>
      </div>

      {/* XP popup */}
      {showXp && (
        <XpPopup
          amount={xpAmount}
          attribute={habit.attribute}
          onDone={() => setShowXp(false)}
        />
      )}
    </div>
  );
}

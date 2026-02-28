import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, MoreVertical, Pencil, Archive, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { HabitToday } from '@/types';

interface Props {
  habit: HabitToday;
  onCheck: (id: string) => void;
  onEdit?: (habitId: string) => void;
  onArchive?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  onMoveUp?: (habitId: string) => void;
  onMoveDown?: (habitId: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function HabitCard({ habit, onCheck, onEdit, onArchive, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const [animating, setAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleCheck = () => {
    setAnimating(true);
    onCheck(habit.id);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <motion.div
      className="card-base relative pl-6 pr-4 py-3 flex items-center gap-3 group"
      style={{ opacity: habit.completed ? 0.7 : 1 }}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: habit.completed ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Category stripe */}
      <div
        className="category-stripe"
        style={{ backgroundColor: habit.category_color || '#FF6B00' }}
      />

      {/* Checkbox */}
      <div className="relative">
        <button
          onClick={handleCheck}
          className={`habit-check ${habit.completed ? 'checked' : ''}`}
        >
          {habit.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Check size={16} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Ki burst effect */}
        {animating && !habit.completed && (
          <div className="ki-burst-ring absolute inset-0 w-7 h-7" />
        )}
      </div>

      {/* Emoji + Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.icon_emoji}</span>
          <span
            className={`text-sm font-semibold ${habit.completed ? 'line-through' : ''}`}
            style={{ color: habit.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {habit.title}
          </span>
        </div>
      </div>

      {/* Points + Streak + Menu */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Points badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: habit.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 107, 0, 0.1)',
            color: habit.completed ? '#10B981' : '#FF6B00',
          }}
        >
          {habit.completed ? `+${habit.points_awarded}` : `${Math.floor(habit.base_points * (habit.category_multiplier || 1))}`} PL
        </span>

        {/* Habit streak */}
        {habit.current_streak > 0 && (
          <div className="flex items-center gap-0.5 text-xs" style={{ color: habit.current_streak >= 7 ? '#FFD700' : 'var(--text-muted)' }}>
            <Flame size={12} />
            <span className="font-bold">{habit.current_streak}</span>
          </div>
        )}

        {/* Context menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreVertical size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-8 z-50 w-36 rounded-lg py-1 shadow-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                {onEdit && (
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(habit.id); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
                {onMoveUp && !isFirst && (
                  <button
                    onClick={() => { setMenuOpen(false); onMoveUp(habit.id); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ChevronUp size={12} /> Move Up
                  </button>
                )}
                {onMoveDown && !isLast && (
                  <button
                    onClick={() => { setMenuOpen(false); onMoveDown(habit.id); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ChevronDown size={12} /> Move Down
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={() => { setMenuOpen(false); onArchive(habit.id); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Archive size={12} /> Archive
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(habit.id); }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-white/5 transition-colors text-red-400"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

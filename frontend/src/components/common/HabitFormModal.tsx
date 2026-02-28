import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil } from 'lucide-react';
import type { TaskCategory, Habit } from '@/types';
import { categoryApi } from '@/services/api';
import { useHabitStore } from '@/store/habitStore';

const EMOJI_OPTIONS = [
  '🧘', '🏋️', '📖', '🧴', '😴', '💧', '🏃', '🎯',
  '✍️', '🧹', '💊', '🥗', '🎵', '🧠', '📱', '⭐',
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom' },
];

const DAY_OPTIONS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editHabit?: Habit | null;
}

export default function HabitFormModal({ isOpen, onClose, editHabit }: Props) {
  const { createHabit, updateHabit } = useHabitStore();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconEmoji, setIconEmoji] = useState('⭐');
  const [categoryId, setCategoryId] = useState('');
  const [basePoints, setBasePoints] = useState(10);
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [targetTime, setTargetTime] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editHabit;

  useEffect(() => {
    categoryApi.list().then(setCategories);
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categoryId && !editHabit) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, editHabit]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editHabit && isOpen) {
      setTitle(editHabit.title);
      setDescription(editHabit.description || '');
      setIconEmoji(editHabit.icon_emoji);
      setCategoryId(editHabit.category_id);
      setBasePoints(editHabit.base_points);
      setFrequency(editHabit.frequency);
      setCustomDays(editHabit.custom_days || []);
      setTargetTime(editHabit.target_time || '');
      setIsTemporary(editHabit.is_temporary);
      setEndDate(editHabit.end_date || '');
    } else if (!editHabit && isOpen) {
      reset();
    }
  }, [editHabit, isOpen]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setIconEmoji('⭐');
    setBasePoints(10);
    setFrequency('daily');
    setCustomDays([]);
    setTargetTime('');
    setIsTemporary(false);
    setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateHabit(editHabit.id, {
          category_id: categoryId,
          title: title.trim(),
          description: description.trim() || null,
          icon_emoji: iconEmoji,
          base_points: basePoints,
          frequency: frequency as Habit['frequency'],
          custom_days: frequency === 'custom' ? customDays : null,
          target_time: targetTime || null,
          is_temporary: isTemporary,
          end_date: isTemporary && endDate ? endDate : null,
        });
      } else {
        await createHabit({
          category_id: categoryId,
          title: title.trim(),
          description: description.trim() || undefined,
          icon_emoji: iconEmoji,
          base_points: basePoints,
          frequency,
          custom_days: frequency === 'custom' ? customDays : undefined,
          target_time: targetTime || undefined,
          is_temporary: isTemporary,
          end_date: isTemporary && endDate ? endDate : undefined,
        });
      }
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-power tracking-wide text-saiyan-orange">
                {isEditing
                  ? <><Pencil size={18} className="inline mr-1" /> EDIT HABIT</>
                  : <><Plus size={18} className="inline mr-1" /> NEW HABIT</>}
              </h2>
              <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Icon</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIconEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        iconEmoji === emoji ? 'ring-2 ring-saiyan-orange scale-110' : ''
                      }`}
                      style={{ background: iconEmoji === emoji ? 'rgba(255,107,0,0.15)' : 'var(--bg-card-hover)' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Habit Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Meditate 5 minutes"
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-saiyan-orange/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional details..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-saiyan-orange/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        categoryId === cat.id ? 'ring-2 ring-offset-1' : 'opacity-60'
                      }`}
                      style={{
                        background: `${cat.color_code}20`,
                        color: cat.color_code,
                        ringColor: cat.color_code,
                      }}
                    >
                      {cat.name} ({cat.point_multiplier}x)
                    </button>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Base Points: {basePoints}
                </label>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={basePoints}
                  onChange={e => setBasePoints(Number(e.target.value))}
                  className="w-full mt-1 accent-saiyan-orange"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Frequency</label>
                <div className="flex gap-2 mt-1">
                  {FREQUENCY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFrequency(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        frequency === opt.value ? 'bg-saiyan-orange text-white' : ''
                      }`}
                      style={frequency !== opt.value ? { background: 'var(--bg-primary)', color: 'var(--text-secondary)' } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Days */}
              {frequency === 'custom' && (
                <div className="flex flex-wrap gap-1.5">
                  {DAY_OPTIONS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                        customDays.includes(day.value) ? 'bg-saiyan-blue text-white' : ''
                      }`}
                      style={!customDays.includes(day.value) ? { background: 'var(--bg-primary)', color: 'var(--text-muted)' } : {}}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Target Time */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Target Time (optional)
                </label>
                <input
                  type="time"
                  value={targetTime}
                  onChange={e => setTargetTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-saiyan-orange/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              </div>

              {/* Temporary Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTemporary(!isTemporary)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    isTemporary ? 'bg-saiyan-orange' : ''
                  }`}
                  style={!isTemporary ? { background: 'var(--border-color)' } : {}}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                    isTemporary ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Temporary habit (has end date)
                </span>
              </div>

              {isTemporary && (
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-saiyan-orange to-saiyan-gold transition-all hover:shadow-lg hover:shadow-saiyan-orange/30 disabled:opacity-40"
              >
                {submitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Habit')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

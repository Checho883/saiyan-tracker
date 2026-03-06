import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { HabitTodayResponse, Attribute, Importance, Frequency } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { useRewardStore } from '../../store/rewardStore';

const ATTRIBUTES: { value: Attribute; label: string; color: string }[] = [
  { value: 'str', label: 'STR', color: 'bg-attr-str' },
  { value: 'vit', label: 'VIT', color: 'bg-attr-vit' },
  { value: 'int', label: 'INT', color: 'bg-attr-int' },
  { value: 'ki', label: 'KI', color: 'bg-attr-ki' },
];

const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'critical', label: 'Critical' },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom' },
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface HabitFormProps {
  habit?: HabitTodayResponse;
  onClose: () => void;
}

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const createHabit = useHabitStore((s) => s.createHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const categories = useRewardStore((s) => s.categories);

  const [title, setTitle] = useState(habit?.title ?? '');
  const [attribute, setAttribute] = useState<Attribute>(habit?.attribute ?? 'str');
  const [importance, setImportance] = useState<Importance>(habit?.importance ?? 'normal');
  const [categoryId, setCategoryId] = useState<string>(habit?.category_id ?? '');
  const [frequency, setFrequency] = useState<Frequency>(habit?.frequency ?? 'daily');
  const [customDays, setCustomDays] = useState<number[]>(habit?.custom_days ?? []);
  const [description, setDescription] = useState(habit?.description ?? '');
  const [iconEmoji, setIconEmoji] = useState(habit?.icon_emoji ?? '');
  const [targetTime, setTargetTime] = useState(habit?.target_time ?? '');
  const [isTemporary, setIsTemporary] = useState(habit?.is_temporary ?? false);
  const [startDate, setStartDate] = useState(habit?.start_date ?? new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(habit?.end_date ?? '');
  const [showMore, setShowMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!habit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (isEdit) {
        await updateHabit(habit.id, {
          title: title.trim(),
          attribute,
          importance,
          category_id: categoryId || null,
          frequency,
          custom_days: frequency === 'custom' ? customDays : null,
          description: description.trim() || null,
          icon_emoji: iconEmoji || undefined,
          target_time: targetTime || null,
          is_temporary: isTemporary,
          start_date: isTemporary ? startDate : undefined,
          end_date: isTemporary ? (endDate || null) : null,
        });
      } else {
        await createHabit({
          title: title.trim(),
          attribute,
          importance,
          category_id: categoryId || null,
          frequency,
          custom_days: frequency === 'custom' ? customDays : null,
          description: description.trim() || null,
          icon_emoji: iconEmoji || '⚡',
          is_temporary: isTemporary,
          start_date: isTemporary ? startDate : today,
          end_date: isTemporary ? (endDate || null) : null,
          target_time: targetTime || null,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-6 pt-3 space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="habit-title" className="block text-sm font-medium text-text-secondary mb-1">
          Title
        </label>
        <input
          id="habit-title"
          type="text"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Push-ups"
          className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-saiyan-500"
        />
      </div>

      {/* Attribute */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Attribute</label>
        <div className="flex gap-2">
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr.value}
              type="button"
              onClick={() => setAttribute(attr.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                attribute === attr.value
                  ? `${attr.color} text-white`
                  : 'bg-space-700 text-text-secondary'
              }`}
            >
              {attr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Importance */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Importance</label>
        <div className="flex gap-2">
          {IMPORTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setImportance(opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                importance === opt.value
                  ? 'bg-saiyan-500 text-white'
                  : 'bg-space-700 text-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="habit-category" className="block text-sm font-medium text-text-secondary mb-1">
          Category
        </label>
        <select
          id="habit-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-saiyan-500"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Frequency — always visible (not behind "More options") */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Frequency</label>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFrequency(opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                frequency === opt.value
                  ? 'bg-saiyan-500 text-white'
                  : 'bg-space-700 text-text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Days — circular iOS-style day picker */}
      {frequency === 'custom' && (
        <div className="flex justify-center gap-2">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleCustomDay(i)}
              className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                customDays.includes(i)
                  ? 'bg-saiyan-500 text-white'
                  : 'bg-space-700 text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Temporary Habit Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">Temporary habit</label>
          <button
            type="button"
            role="switch"
            aria-checked={isTemporary}
            onClick={() => setIsTemporary(!isTemporary)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isTemporary ? 'bg-saiyan-500' : 'bg-space-600'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isTemporary ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isTemporary && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="habit-start-date" className="block text-xs text-text-muted mb-1">
                Start date
              </label>
              <input
                id="habit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-saiyan-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="habit-end-date" className="block text-xs text-text-muted mb-1">
                End date
              </label>
              <input
                id="habit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-saiyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* More Options Toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        More options
      </button>

      {showMore && (
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="habit-description" className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-saiyan-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Icon Emoji */}
          <div>
            <label htmlFor="habit-icon" className="block text-sm font-medium text-text-secondary mb-1">
              Icon
            </label>
            <input
              id="habit-icon"
              type="text"
              value={iconEmoji}
              onChange={(e) => setIconEmoji(e.target.value)}
              placeholder="⚡"
              className="w-20 bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-center text-text-primary focus:outline-none focus:border-saiyan-500"
            />
          </div>

          {/* Target Time */}
          <div>
            <label htmlFor="habit-time" className="block text-sm font-medium text-text-secondary mb-1">
              Target Time
            </label>
            <input
              id="habit-time"
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="bg-space-700 border border-space-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-saiyan-500"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || (frequency === 'custom' && customDays.length === 0) || (isTemporary && !endDate)}
        className="w-full bg-saiyan-500 text-white rounded-lg py-3 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? 'Save Changes' : 'Create Habit'}
      </button>
    </form>
  );
}

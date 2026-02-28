import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import type { TaskCategory, EnergyLevel } from '@/types';
import { ENERGY_CONFIG } from '@/types';

interface Props {
  show: boolean;
  categories: TaskCategory[];
  onClose: () => void;
  onSubmit: (data: {
    category_id: string;
    title: string;
    description?: string;
    base_points: number;
    energy_level: string;
    estimated_minutes?: number;
  }) => void;
}

export default function TaskFormModal({ show, categories, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [basePoints, setBasePoints] = useState(10);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    onSubmit({
      category_id: categoryId,
      title: title.trim(),
      description: description.trim() || undefined,
      base_points: basePoints,
      energy_level: energyLevel,
      estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    });
    // Reset form
    setTitle('');
    setDescription('');
    setBasePoints(10);
    setEnergyLevel('medium');
    setEstimatedMinutes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-saiyan-card border border-saiyan-border rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-saiyan-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                New Training Task
              </h2>
              <button onClick={onClose} className="text-saiyan-muted hover:text-saiyan-text">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs text-saiyan-muted uppercase tracking-wider">Task Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 bg-saiyan-darker border border-saiyan-border rounded-lg px-3 py-2 text-saiyan-text focus:border-saiyan-orange focus:outline-none"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-saiyan-muted uppercase tracking-wider">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full mt-1 bg-saiyan-darker border border-saiyan-border rounded-lg px-3 py-2 text-saiyan-text focus:border-saiyan-orange focus:outline-none resize-none"
                  rows={2}
                  placeholder="Any details..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-saiyan-muted uppercase tracking-wider">Category</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                        categoryId === cat.id ? 'bg-opacity-20' : 'border-saiyan-border'
                      }`}
                      style={categoryId === cat.id ? {
                        borderColor: cat.color_code,
                        backgroundColor: `${cat.color_code}15`,
                        color: cat.color_code,
                      } : {}}
                    >
                      {cat.name} ({cat.point_multiplier}x)
                    </button>
                  ))}
                </div>
              </div>

              {/* Points & Duration Row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-saiyan-muted uppercase tracking-wider flex items-center gap-1">
                    <Zap size={12} /> Base Points
                  </label>
                  <input
                    type="number"
                    value={basePoints}
                    onChange={e => setBasePoints(Number(e.target.value))}
                    className="w-full mt-1 bg-saiyan-darker border border-saiyan-border rounded-lg px-3 py-2 text-saiyan-text focus:border-saiyan-orange focus:outline-none"
                    min={1}
                    max={500}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-saiyan-muted uppercase tracking-wider">Minutes</label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={e => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                    className="w-full mt-1 bg-saiyan-darker border border-saiyan-border rounded-lg px-3 py-2 text-saiyan-text focus:border-saiyan-orange focus:outline-none"
                    placeholder="Est."
                    min={1}
                  />
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="text-xs text-saiyan-muted uppercase tracking-wider">Energy Required</label>
                <div className="flex gap-2 mt-1">
                  {(['low', 'medium', 'high'] as EnergyLevel[]).map(level => {
                    const config = ENERGY_CONFIG[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEnergyLevel(level)}
                        className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${
                          energyLevel === level ? '' : 'border-saiyan-border text-saiyan-muted'
                        }`}
                        style={energyLevel === level ? {
                          borderColor: config.color,
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                        } : {}}
                      >
                        {config.emoji} {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-saiyan-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                Add Task
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

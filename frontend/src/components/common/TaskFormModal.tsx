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
    category_id: string; title: string; description?: string;
    base_points: number; energy_level: string; estimated_minutes?: number;
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
      category_id: categoryId, title: title.trim(),
      description: description.trim() || undefined, base_points: basePoints,
      energy_level: energyLevel, estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    });
    setTitle(''); setDescription(''); setBasePoints(10); setEnergyLevel('medium'); setEstimatedMinutes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-power tracking-wide text-saiyan-blue">NEW TASK</h2>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Task Name *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="What needs to be done?"
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-saiyan-blue/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Details..."
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-saiyan-blue/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryId === cat.id ? 'ring-2 ring-offset-1' : 'opacity-60'}`}
                      style={{ background: `${cat.color_code}20`, color: cat.color_code, ringColor: cat.color_code }}>
                      {cat.name} ({cat.point_multiplier}x)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Zap size={10} /> Points
                  </label>
                  <input type="number" value={basePoints} onChange={e => setBasePoints(Number(e.target.value))} min={1} max={500}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Minutes</label>
                  <input type="number" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Est." min={1}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Energy</label>
                <div className="flex gap-2 mt-1">
                  {(['low', 'medium', 'high'] as EnergyLevel[]).map(level => {
                    const config = ENERGY_CONFIG[level];
                    return (
                      <button key={level} type="button" onClick={() => setEnergyLevel(level)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${energyLevel === level ? '' : ''}`}
                        style={energyLevel === level
                          ? { border: `2px solid ${config.color}`, background: `${config.color}15`, color: config.color }
                          : { border: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        {config.emoji} {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit"
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-saiyan-blue to-blue-600 hover:shadow-lg hover:shadow-saiyan-blue/30">
                Add Task
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

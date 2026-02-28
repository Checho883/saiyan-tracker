import { motion } from 'framer-motion';
import { Check, Zap, Clock, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { ENERGY_CONFIG } from '@/types';

interface Props {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isCompleted?: boolean;
  index: number;
}

export default function TaskCard({ task, onComplete, onDelete, isCompleted, index }: Props) {
  const energyInfo = ENERGY_CONFIG[task.energy_level as keyof typeof ENERGY_CONFIG] || ENERGY_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group card-base relative p-3 transition-all ${isCompleted ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => !isCompleted && onComplete(task.id)}
          disabled={isCompleted}
          className={`mt-0.5 habit-check ${isCompleted ? 'checked' : ''}`}
        >
          {isCompleted && <Check size={14} className="text-white" />}
        </motion.button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${isCompleted ? 'line-through' : ''}`}
            style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${task.category_color}20`, color: task.category_color }}>
              {task.category_name}
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {energyInfo.emoji} {energyInfo.label}
            </span>
            {task.estimated_minutes && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Clock size={10} /> {task.estimated_minutes}m
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-saiyan-blue font-bold text-xs font-power">
            <Zap size={12} />
            <span>{task.effective_points || task.base_points}</span>
          </div>
        </div>

        <button onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: 'var(--text-muted)' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

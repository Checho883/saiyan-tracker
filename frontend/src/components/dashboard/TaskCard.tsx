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
      className={`group relative bg-saiyan-card border border-saiyan-border rounded-lg p-4 hover:border-saiyan-orange/40 transition-all ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => !isCompleted && onComplete(task.id)}
          disabled={isCompleted}
          className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            isCompleted
              ? 'bg-green-500 border-green-500'
              : 'border-saiyan-border hover:border-saiyan-orange'
          }`}
        >
          {isCompleted && <Check size={14} className="text-white" />}
        </motion.button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base ${isCompleted ? 'line-through text-saiyan-muted' : 'text-saiyan-text'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-saiyan-muted mt-0.5 truncate">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {/* Category Badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${task.category_color}20`, color: task.category_color }}
            >
              {task.category_name}
            </span>
            {/* Energy */}
            <span className="text-xs text-saiyan-muted flex items-center gap-1">
              {energyInfo.emoji} {energyInfo.label}
            </span>
            {/* Duration */}
            {task.estimated_minutes && (
              <span className="text-xs text-saiyan-muted flex items-center gap-1">
                <Clock size={12} /> {task.estimated_minutes}m
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-saiyan-orange font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <Zap size={14} />
            <span>{task.effective_points || task.base_points}</span>
          </div>
          {task.category_multiplier && task.category_multiplier !== 1.0 && (
            <span className="text-xs text-saiyan-muted">
              {task.base_points} × {task.category_multiplier}x
            </span>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-saiyan-muted hover:text-red-400 p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

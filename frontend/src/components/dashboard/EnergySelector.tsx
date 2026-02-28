import { motion } from 'framer-motion';
import type { EnergyLevel } from '@/types';
import { ENERGY_CONFIG } from '@/types';

interface Props {
  selected: EnergyLevel | null;
  onSelect: (level: EnergyLevel | null) => void;
}

const levels: EnergyLevel[] = ['low', 'medium', 'high'];

export default function EnergySelector({ selected, onSelect }: Props) {
  return (
    <div className="bg-saiyan-card border border-saiyan-border rounded-xl p-4">
      <p className="text-sm text-saiyan-muted mb-3 uppercase tracking-wider">How's your energy?</p>
      <div className="flex gap-2">
        {levels.map((level) => {
          const config = ENERGY_CONFIG[level];
          const isActive = selected === level;
          return (
            <motion.button
              key={level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(isActive ? null : level)}
              className={`flex-1 py-3 px-3 rounded-lg border-2 transition-all text-center ${
                isActive
                  ? 'border-current bg-opacity-20'
                  : 'border-saiyan-border hover:border-saiyan-muted'
              }`}
              style={isActive ? { borderColor: config.color, backgroundColor: `${config.color}15` } : {}}
            >
              <span className="text-2xl block mb-1">{config.emoji}</span>
              <span className={`text-xs font-medium ${isActive ? '' : 'text-saiyan-muted'}`}
                    style={isActive ? { color: config.color } : {}}>
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

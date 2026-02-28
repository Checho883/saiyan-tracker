import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; notes?: string }) => void;
}

const REASONS = [
  { value: 'sick', label: 'Sick', emoji: '🤒' },
  { value: 'vacation', label: 'Vacation', emoji: '🏖️' },
  { value: 'rest', label: 'Rest Day', emoji: '😴' },
  { value: 'injury', label: 'Injury', emoji: '🩹' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

export default function OffDayModal({ show, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    onSubmit({ reason, notes: notes.trim() || undefined });
    setReason('');
    setNotes('');
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
            className="bg-saiyan-card border border-saiyan-border rounded-xl p-6 w-full max-w-sm mx-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-saiyan-text">Mark Off Day</h2>
              <button onClick={onClose} className="text-saiyan-muted hover:text-saiyan-text">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-saiyan-muted mb-4">
              Even Saiyans need rest. This won't break your streak.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {REASONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      reason === r.value
                        ? 'border-saiyan-blue bg-saiyan-blue/10'
                        : 'border-saiyan-border hover:border-saiyan-muted'
                    }`}
                  >
                    <span className="text-xl block mb-1">{r.emoji}</span>
                    <span className="text-xs">{r.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-saiyan-muted uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full mt-1 bg-saiyan-darker border border-saiyan-border rounded-lg px-3 py-2 text-saiyan-text focus:border-saiyan-blue focus:outline-none resize-none"
                  rows={2}
                  placeholder="Any details..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={!reason}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-saiyan-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Mark as Off Day
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
    setReason(''); setNotes(''); onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="w-full max-w-sm rounded-xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Mark Off Day</h2>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Even Saiyans need rest. This won't break your streak.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {REASONS.map(r => (
                  <button key={r.value} type="button" onClick={() => setReason(r.value)}
                    className="p-3 rounded-lg text-center transition-all"
                    style={{
                      border: `2px solid ${reason === r.value ? '#1E90FF' : 'var(--border-color)'}`,
                      background: reason === r.value ? 'rgba(30,144,255,0.1)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}>
                    <span className="text-xl block mb-1">{r.emoji}</span>
                    <span className="text-xs">{r.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any details..."
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>

              <button type="submit" disabled={!reason}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-saiyan-blue hover:bg-blue-600 disabled:opacity-40">
                Mark as Off Day
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

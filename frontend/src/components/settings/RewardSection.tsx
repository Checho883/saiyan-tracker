import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRewardStore } from '../../store/rewardStore';
import { useShallow } from 'zustand/react/shallow';
import { RewardFormSheet } from './RewardFormSheet';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';
import type { RewardResponse, Rarity } from '../../types';

const rarityColors: Record<Rarity, string> = {
  common: 'bg-gray-500/20 text-gray-300',
  rare: 'bg-blue-500/20 text-blue-300',
  epic: 'bg-purple-500/20 text-purple-300',
};

export function RewardSection() {
  const { rewards, fetchRewards, deleteReward } = useRewardStore(
    useShallow((s) => ({ rewards: s.rewards, fetchRewards: s.fetchRewards, deleteReward: s.deleteReward }))
  );

  const [editingReward, setEditingReward] = useState<RewardResponse | undefined>();
  const [deletingReward, setDeletingReward] = useState<RewardResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleEdit = (reward: RewardResponse) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleDelete = (reward: RewardResponse) => {
    setDeletingReward(reward);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReward(undefined);
  };

  // Distribution stats
  const dist = { common: 0, rare: 0, epic: 0 };
  rewards.forEach((r) => dist[r.rarity]++);

  return (
    <div className="space-y-3">
      {/* Distribution stats */}
      {rewards.length > 0 && (
        <div className="flex gap-3 text-xs text-text-muted">
          <span>Common: {dist.common}</span>
          <span>Rare: {dist.rare}</span>
          <span>Epic: {dist.epic}</span>
        </div>
      )}

      {/* Reward list */}
      {rewards.map((reward) => (
        <div key={reward.id} className="bg-space-700 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary">{reward.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${rarityColors[reward.rarity]}`}>
              {reward.rarity}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(reward)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Edit ${reward.title}`}
            >
              <Pencil className="w-4 h-4 text-text-muted" />
            </button>
            <button
              onClick={() => handleDelete(reward)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Delete ${reward.title}`}
            >
              <Trash2 className="w-4 h-4 text-danger" />
            </button>
          </div>
        </div>
      ))}

      {rewards.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">No rewards yet</p>
      )}

      {/* Add button */}
      <button
        onClick={() => { setEditingReward(undefined); setShowForm(true); }}
        className="w-full flex items-center justify-center gap-2 bg-space-700 hover:bg-space-600 rounded-lg p-3 text-sm text-saiyan-500 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Reward
      </button>

      <RewardFormSheet open={showForm} onClose={handleCloseForm} reward={editingReward} />

      <DeleteConfirmDialog
        open={!!deletingReward}
        onClose={() => setDeletingReward(null)}
        onConfirm={() => deletingReward && deleteReward(deletingReward.id)}
        itemTitle={deletingReward?.title ?? ''}
      />
    </div>
  );
}

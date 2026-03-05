import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import type { RewardResponse, Rarity } from '../../types';
import { useRewardStore } from '../../store/rewardStore';

interface RewardFormSheetProps {
  open: boolean;
  onClose: () => void;
  reward?: RewardResponse;
}

const rarities: { value: Rarity; label: string; activeClass: string }[] = [
  { value: 'common', label: 'Common', activeClass: 'bg-gray-500/20 border-gray-500 text-gray-300' },
  { value: 'rare', label: 'Rare', activeClass: 'bg-blue-500/20 border-blue-500 text-blue-300' },
  { value: 'epic', label: 'Epic', activeClass: 'bg-purple-500/20 border-purple-500 text-purple-300' },
];

export function RewardFormSheet({ open, onClose, reward }: RewardFormSheetProps) {
  const createReward = useRewardStore((s) => s.createReward);
  const updateReward = useRewardStore((s) => s.updateReward);

  const [title, setTitle] = useState('');
  const [rarity, setRarity] = useState<Rarity>('common');

  useEffect(() => {
    if (reward) {
      setTitle(reward.title);
      setRarity(reward.rarity);
    } else {
      setTitle('');
      setRarity('common');
    }
  }, [reward, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (reward) {
      await updateReward(reward.id, { title: title.trim(), rarity });
    } else {
      await createReward({ title: title.trim(), rarity });
    }
    onClose();
  };

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-space-800 rounded-t-2xl max-h-[85vh] overflow-y-auto outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-space-600" />
          <Drawer.Title className="px-4 pt-4 text-lg font-bold text-text-primary">
            {reward ? 'Edit Reward' : 'New Reward'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {reward ? 'Edit a capsule reward' : 'Create a new capsule reward'}
          </Drawer.Description>

          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="reward-title" className="block text-sm text-text-secondary mb-1">Title</label>
              <input
                id="reward-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reward title"
                className="w-full bg-space-700 border border-space-600 rounded-lg p-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-saiyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Rarity</label>
              <div className="flex gap-2">
                {rarities.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRarity(r.value)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      rarity === r.value
                        ? r.activeClass
                        : 'border-space-600 text-text-muted hover:border-space-500'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full bg-saiyan-500 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              {reward ? 'Save Changes' : 'Create Reward'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

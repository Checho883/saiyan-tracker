import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import type { WishResponse } from '../../types';
import { useRewardStore } from '../../store/rewardStore';

interface WishFormSheetProps {
  open: boolean;
  onClose: () => void;
  wish?: WishResponse;
}

export function WishFormSheet({ open, onClose, wish }: WishFormSheetProps) {
  const createWish = useRewardStore((s) => s.createWish);
  const updateWish = useRewardStore((s) => s.updateWish);

  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (wish) {
      setTitle(wish.title);
      setIsActive(wish.is_active);
    } else {
      setTitle('');
      setIsActive(true);
    }
  }, [wish, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (wish) {
      await updateWish(wish.id, { title: title.trim(), is_active: isActive });
    } else {
      await createWish({ title: title.trim() });
    }
    onClose();
  };

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()} snapPoints={[0.9]}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-space-800 rounded-t-2xl max-h-[90vh] overflow-y-auto outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-space-600" />
          <Drawer.Title className="px-4 pt-4 text-lg font-bold text-text-primary">
            {wish ? 'Edit Wish' : 'New Wish'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {wish ? 'Edit a Shenron wish' : 'Create a new Shenron wish'}
          </Drawer.Description>

          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="wish-title" className="block text-sm text-text-secondary mb-1">Title</label>
              <input
                id="wish-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your wish"
                className="w-full bg-space-700 border border-space-600 rounded-lg p-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-saiyan-500"
              />
            </div>

            {wish && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Active</span>
                <button
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isActive ? 'bg-saiyan-500' : 'bg-space-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full bg-saiyan-500 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              {wish ? 'Save Changes' : 'Create Wish'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRewardStore } from '../../store/rewardStore';
import { useShallow } from 'zustand/react/shallow';
import { WishFormSheet } from './WishFormSheet';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';
import type { WishResponse } from '../../types';

export function WishSection() {
  const { wishes, fetchWishes, updateWish, deleteWish } = useRewardStore(
    useShallow((s) => ({
      wishes: s.wishes,
      fetchWishes: s.fetchWishes,
      updateWish: s.updateWish,
      deleteWish: s.deleteWish,
    }))
  );

  const [editingWish, setEditingWish] = useState<WishResponse | undefined>();
  const [deletingWish, setDeletingWish] = useState<WishResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleEdit = (wish: WishResponse) => {
    setEditingWish(wish);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWish(undefined);
  };

  const handleToggleActive = (wish: WishResponse) => {
    updateWish(wish.id, { is_active: !wish.is_active });
  };

  return (
    <div className="space-y-3">
      {wishes.map((wish) => (
        <div key={wish.id} className="bg-space-700 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Active toggle */}
            <button
              role="switch"
              aria-checked={wish.is_active}
              aria-label={`Toggle ${wish.title} active`}
              onClick={() => handleToggleActive(wish)}
              className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                wish.is_active ? 'bg-saiyan-500' : 'bg-space-500'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  wish.is_active ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <span className={`text-sm ${wish.is_active ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                {wish.title}
              </span>
              <span className="text-xs text-text-muted ml-2">
                wished {wish.times_wished}x
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(wish)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Edit ${wish.title}`}
            >
              <Pencil className="w-4 h-4 text-text-muted" />
            </button>
            <button
              onClick={() => setDeletingWish(wish)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Delete ${wish.title}`}
            >
              <Trash2 className="w-4 h-4 text-danger" />
            </button>
          </div>
        </div>
      ))}

      {wishes.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">No wishes yet</p>
      )}

      <button
        onClick={() => { setEditingWish(undefined); setShowForm(true); }}
        className="w-full flex items-center justify-center gap-2 bg-space-700 hover:bg-space-600 rounded-lg p-3 text-sm text-saiyan-500 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Wish
      </button>

      <WishFormSheet open={showForm} onClose={handleCloseForm} wish={editingWish} />

      <DeleteConfirmDialog
        open={!!deletingWish}
        onClose={() => setDeletingWish(null)}
        onConfirm={() => deletingWish && deleteWish(deletingWish.id)}
        itemTitle={deletingWish?.title ?? ''}
      />
    </div>
  );
}

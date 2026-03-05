import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import type { CategoryResponse } from '../../types';
import { useRewardStore } from '../../store/rewardStore';

interface CategoryFormSheetProps {
  open: boolean;
  onClose: () => void;
  category?: CategoryResponse;
}

const COLOR_OPTIONS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

const EMOJI_OPTIONS = [
  '💪', '🧠', '🏃', '📚', '🎯', '💤', '🥗', '💊',
  '🧘', '🎸', '💻', '✍️', '🏋️', '🚶', '💧', '🍎',
  '🎨', '🔬', '📝', '🌅', '🧹', '💰', '🤝', '❤️',
];

export function CategoryFormSheet({ open, onClose, category }: CategoryFormSheetProps) {
  const createCategory = useRewardStore((s) => s.createCategory);
  const updateCategory = useRewardStore((s) => s.updateCategory);

  const [name, setName] = useState('');
  const [colorCode, setColorCode] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColorCode(category.color_code);
      setIcon(category.icon);
    } else {
      setName('');
      setColorCode(COLOR_OPTIONS[0]);
      setIcon(EMOJI_OPTIONS[0]);
    }
  }, [category, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (category) {
      await updateCategory(category.id, { name: name.trim(), color_code: colorCode, icon });
    } else {
      await createCategory({ name: name.trim(), color_code: colorCode, icon });
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
            {category ? 'Edit Category' : 'New Category'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {category ? 'Edit a habit category' : 'Create a new habit category'}
          </Drawer.Description>

          <div className="p-4 space-y-4">
            {/* Name input */}
            <div>
              <label htmlFor="category-name" className="block text-sm text-text-secondary mb-1">Name</label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="w-full bg-space-700 border border-space-600 rounded-lg p-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-saiyan-500"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Color</label>
              <div className="flex gap-3 flex-wrap">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColorCode(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      colorCode === color ? 'ring-2 ring-white ring-offset-2 ring-offset-space-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Emoji selector */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`text-xl p-1 rounded transition-colors ${
                      icon === emoji
                        ? 'bg-saiyan-500/20 ring-1 ring-saiyan-500'
                        : 'hover:bg-space-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full bg-saiyan-500 text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

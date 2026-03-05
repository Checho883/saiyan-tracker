import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRewardStore } from '../../store/rewardStore';
import { useShallow } from 'zustand/react/shallow';
import { CategoryFormSheet } from './CategoryFormSheet';
import { DeleteConfirmDialog } from '../common/DeleteConfirmDialog';
import type { CategoryResponse } from '../../types';

export function CategorySection() {
  const { categories, fetchCategories, deleteCategory } = useRewardStore(
    useShallow((s) => ({
      categories: s.categories,
      fetchCategories: s.fetchCategories,
      deleteCategory: s.deleteCategory,
    }))
  );

  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: CategoryResponse) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.id} className="bg-space-700 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm text-text-primary">{cat.name}</span>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color_code }}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(cat)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Edit ${cat.name}`}
            >
              <Pencil className="w-4 h-4 text-text-muted" />
            </button>
            <button
              onClick={() => setDeletingCategory(cat)}
              className="p-1.5 rounded hover:bg-space-600 transition-colors"
              aria-label={`Delete ${cat.name}`}
            >
              <Trash2 className="w-4 h-4 text-danger" />
            </button>
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">No categories yet</p>
      )}

      <button
        onClick={() => { setEditingCategory(undefined); setShowForm(true); }}
        className="w-full flex items-center justify-center gap-2 bg-space-700 hover:bg-space-600 rounded-lg p-3 text-sm text-saiyan-500 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>

      <CategoryFormSheet open={showForm} onClose={handleCloseForm} category={editingCategory} />

      <DeleteConfirmDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deletingCategory && deleteCategory(deletingCategory.id)}
        itemTitle={deletingCategory?.name ?? ''}
      />
    </div>
  );
}

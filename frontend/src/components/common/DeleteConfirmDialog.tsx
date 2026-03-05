interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  itemTitle,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-space-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-text-primary mb-2">
          Delete &lsquo;{itemTitle}&rsquo;?
        </h3>
        <p className="text-sm text-text-secondary mb-5">
          This will permanently delete this item. This action cannot be undone.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg bg-danger text-white font-medium text-sm hover:bg-danger/80 transition-colors"
          >
            Delete Permanently
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-text-muted text-sm hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

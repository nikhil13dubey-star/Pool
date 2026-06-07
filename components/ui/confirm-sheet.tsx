"use client";

// Bottom confirmation sheet — the one pattern for destructive confirms.
// Slides up from the bottom over a scrim; never a native popup / center dialog.
export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="confirm-scrim" onClick={() => !loading && onCancel()}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="ct">{title}</div>
        {message && <div className="cm">{message}</div>}
        <div className="confirm-actions">
          <button className="confirm-btn danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Working…" : confirmLabel}
          </button>
          <button className="confirm-btn cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

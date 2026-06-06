"use client";

import { useRouter } from "next/navigation";

// Full-screen modal sheet (Blinkit-style): slides up over the page behind it,
// which stays visible & dimmed. Swipe-down/tap-scrim or the nav button dismisses.
// No half-height bottom sheets anywhere — this is the one modal pattern.
export function ModalSheet({
  title,
  children,
  doneLabel,
  onDone,
  doneDisabled,
}: {
  title: string;
  children: React.ReactNode;
  doneLabel?: string;
  onDone?: () => void;
  doneDisabled?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="modal-scrim" onClick={() => router.back()}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-nav">
          <button className="c" onClick={() => router.back()}>
            Cancel
          </button>
          <span className="t">{title}</span>
          {doneLabel ? (
            <button
              className="s"
              onClick={onDone}
              disabled={doneDisabled}
              style={doneDisabled ? { opacity: 0.4 } : undefined}
            >
              {doneLabel}
            </button>
          ) : (
            <span style={{ width: 52 }} />
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

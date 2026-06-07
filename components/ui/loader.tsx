export function Loader({ label, compact }: { label?: string; compact?: boolean }) {
  return (
    <div className="loader-wrap" style={compact ? { minHeight: 160 } : undefined}>
      <div className="loader">
        <i />
        <i />
        <i />
        <b />
      </div>
      {label && <div className="loader-label">{label}</div>}
    </div>
  );
}

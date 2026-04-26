export default function GroupLoading() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header skeleton */}
      <div
        style={{
          padding: "24px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 22, width: 140, borderRadius: 8 }} />
      </div>

      {/* Tab strip skeleton */}
      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 32, width: 80, borderRadius: 999 }}
          />
        ))}
      </div>

      {/* Balance card skeleton */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 20 }} />
      </div>

      {/* Expense list skeleton */}
      <div style={{ padding: "0 20px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 64, borderRadius: 14, marginBottom: 10 }}
          />
        ))}
      </div>
    </div>
  );
}

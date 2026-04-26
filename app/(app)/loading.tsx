export default function HomeLoading() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header skeleton */}
      <div
        style={{
          padding: "24px 24px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="skeleton"
            style={{ height: 12, width: 80, marginBottom: 8, borderRadius: 6 }}
          />
          <div className="skeleton" style={{ height: 28, width: 120, borderRadius: 8 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            className="skeleton"
            style={{ width: 38, height: 38, borderRadius: 999 }}
          />
          <div
            className="skeleton"
            style={{ width: 38, height: 38, borderRadius: 999 }}
          />
        </div>
      </div>

      {/* Balance hero skeleton */}
      <div style={{ padding: "8px 24px 24px" }}>
        <div className="skeleton" style={{ height: 96, borderRadius: 20 }} />
      </div>

      {/* Group list skeleton */}
      <div style={{ padding: "0 24px" }}>
        <div
          className="skeleton"
          style={{ height: 14, width: 60, marginBottom: 12, borderRadius: 6 }}
        />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 72, borderRadius: 16, marginBottom: 10 }}
          />
        ))}
      </div>
    </div>
  );
}

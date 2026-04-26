export default function ExpenseDetailLoading() {
  return (
    <div style={{ minHeight: "100vh", padding: "24px 20px" }}>
      {/* Back header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 18, width: 120, borderRadius: 8 }} />
      </div>
      {/* Category icon */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 18 }} />
      </div>
      {/* Title + amount */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          className="skeleton"
          style={{ height: 22, width: 160, borderRadius: 8, margin: "0 auto 12px" }}
        />
        <div
          className="skeleton"
          style={{ height: 48, width: 120, borderRadius: 10, margin: "0 auto" }}
        />
      </div>
      {/* Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 72, borderRadius: 16, marginBottom: 12 }}
        />
      ))}
    </div>
  );
}

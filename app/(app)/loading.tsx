export default function HomeLoading() {
  return (
    <div style={{ padding: "20px 22px 130px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div className="skel" style={{ width: 30, height: 30, borderRadius: 8 }} />
        <div className="skel" style={{ width: 38, height: 38, borderRadius: "50%" }} />
      </div>
      <div
        className="skel"
        style={{ width: 180, height: 34, marginTop: 22, borderRadius: 10 }}
      />
      <div className="skel" style={{ height: 150, marginTop: 18, borderRadius: 24 }} />
      <div
        className="skel"
        style={{ width: 100, height: 22, margin: "28px 4px 14px", borderRadius: 8 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="skel" style={{ aspectRatio: "1/1", borderRadius: 22 }} />
        <div className="skel" style={{ aspectRatio: "1/1", borderRadius: 22 }} />
      </div>
    </div>
  );
}

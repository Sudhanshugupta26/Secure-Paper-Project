import { useEffect, useState } from "react";
import API from "../api/client";
import PaperCard from "../components/cards/PaperCard";

function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/papers")
      .then((res) => {
        console.log("API DATA:", res.data);
        setPapers(res.data);
      })
      .catch((err) => console.log("ERROR:", err))
      .finally(() => setLoading(false));

    // Polling to refresh data every 5 seconds
    const interval = setInterval(() => {
      API.get("/papers")
        .then((res) => setPapers(res.data))
        .catch((err) => console.log("ERROR:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = papers
    .filter((p) => p.docType === "examPaper")
    .filter((p) => {
      const matchStatus = filter === "ALL" || p.status === filter;
      const matchSearch = p.paperId
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });

  const lockedCount = papers.filter((p) => p.status === "LOCKED").length;
  const unlockedCount = papers.filter((p) => p.status === "UNLOCKED").length;

  return (
    <div style={{ padding: "40px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ margin: "0 0 12px 0", fontSize: "2.5rem", fontWeight: "800", color: "#0f172a" }}>
          📄 Exam Paper <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: "#475569", fontSize: "1.05rem", margin: "0" }}>
          Immutably manage, unlock, and audit security exam distributions on Hyperledger Fabric
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        <div className="glass-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "80px", height: "80px", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", borderRadius: "50%" }}></div>
          <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.5px" }}>TOTAL PAPERS</p>
          <h2 style={{ margin: 0, fontSize: "2.75rem", fontWeight: "800", color: "#4f46e5" }}>{papers.filter(p => p.docType === "examPaper").length}</h2>
        </div>
        <div className="glass-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "80px", height: "80px", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", borderRadius: "50%" }}></div>
          <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.5px" }}>UNLOCKED</p>
          <h2 style={{ margin: 0, fontSize: "2.75rem", fontWeight: "800", color: "#16a34a" }}>{unlockedCount}</h2>
        </div>
        <div className="glass-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "80px", height: "80px", background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)", borderRadius: "50%" }}></div>
          <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "0.95rem", fontWeight: "600", letterSpacing: "0.5px" }}>LOCKED</p>
          <h2 style={{ margin: 0, fontSize: "2.75rem", fontWeight: "800", color: "#dc2626" }}>{lockedCount}</h2>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="🔍 Search Exam Paper ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            minWidth: "180px",
            cursor: "pointer",
          }}
        >
          <option value="ALL">📋 All Statuses</option>
          <option value="LOCKED">🔒 Locked Only</option>
          <option value="UNLOCKED">🔓 Unlocked Only</option>
        </select>
      </div>

      {/* Papers List */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "60px", color: "#475569" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>⏳ Loading smart contract records...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "60px", color: "#475569" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>🔍 No registered exam papers found</p>
        </div>
      ) : (
        <div>
          <p style={{ color: "#475569", marginBottom: "20px", fontSize: "0.95rem", fontWeight: "500" }}>
            Showing {filteredData.length} of {papers.filter(p => p.docType === "examPaper").length} registered papers
          </p>
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredData.map((p, i) => (
              <PaperCard key={i} paper={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
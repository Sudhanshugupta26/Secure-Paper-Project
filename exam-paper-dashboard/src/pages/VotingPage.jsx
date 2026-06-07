import { useEffect, useState } from "react";
import API from "../api/client";

export default function VotingPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedApps, setVotedApps] = useState(new Set());

    useEffect(() => {
        setLoading(true);
        API.get("/centers/applications")
            .then(res => setApps(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const vote = async (id, voteType) => {
        try {
            await API.post("/centers/vote", {
                centerId: id,
                vote: voteType
            });

            setVotedApps(prev => new Set([...prev, id]));
        } catch (err) {
            console.log("Vote error:", err);
        }
    };

    const pendingApps = apps.filter(app => app.status === "PENDING");

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#0f172a" }}>🗳️ Vote for New Centers</h1>
                <p style={{ color: "#475569", margin: "0" }}>Approve or reject pending center applications</p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <p>Loading applications...</p>
                </div>
            ) : pendingApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#475569" }}>
                    <p>No pending applications to vote on</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                    {pendingApps.map(app => (
                        <div
                            key={app.id}
                            className="glass-card"
                            style={{
                                padding: "24px",
                                boxShadow: "0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 15px rgba(139, 92, 246, 0.03)",
                                border: "1px solid rgba(139, 92, 246, 0.15)",
                                wordBreak: "break-word",
                            }}
                        >
                            <h3 style={{ margin: "0 0 12px 0", color: "#6d28d9", fontSize: "1.25rem", fontWeight: "700" }}>{app.name}</h3>
                            <p style={{ margin: "0 0 20px 0", color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                                <strong style={{ color: "#0f172a" }}>🆔 ID:</strong> {app.id}
                            </p>

                            {votedApps.has(app.id) ? (
                                <div
                                    style={{
                                        padding: "12px",
                                        background: "rgba(16, 185, 129, 0.08)",
                                        border: "1px solid rgba(16, 185, 129, 0.2)",
                                        borderRadius: "10px",
                                        color: "#065f46",
                                        textAlign: "center",
                                        fontWeight: "600",
                                    }}
                                >
                                    ✅ Vote Submitted
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <button
                                        onClick={() => vote(app.id, "APPROVE")}
                                        style={{
                                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                            borderColor: "#10b981",
                                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #34d399 0%, #10b981 100%)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                        }}
                                    >
                                        👍 Approve
                                    </button>
                                    <button
                                        onClick={() => vote(app.id, "REJECT")}
                                        style={{
                                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                            borderColor: "#ef4444",
                                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #f87171 0%, #ef4444 100%)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                                        }}
                                    >
                                        👎 Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
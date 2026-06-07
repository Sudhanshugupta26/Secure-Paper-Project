import { useEffect, useState } from "react";
import API from "../api/client";

export default function ConsortiumMembers() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        API.get("/centers/applications")
            .then(res => setApps(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#0f172a" }}>🏛️ Consortium Applications</h1>
                <p style={{ color: "#475569", margin: "0" }}>Review pending center applications</p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <p>Loading applications...</p>
                </div>
            ) : apps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <p>No applications found</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {apps.map(app => {
                        const statusColor = app.status === "APPROVED"
                            ? "#10b981"
                            : app.status === "REJECTED"
                                ? "#ef4444"
                                : "#f59e0b";
                        const glowColor = app.status === "APPROVED"
                            ? "rgba(16, 185, 129, 0.1)"
                            : app.status === "REJECTED"
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(245, 158, 11, 0.1)";

                        return (
                            <div
                                key={app.id}
                                className="glass-card"
                                style={{
                                    border: `1px solid ${statusColor}33`,
                                    padding: "24px",
                                    boxShadow: `0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 15px ${glowColor}`,
                                    wordBreak: "break-word",
                                }}
                            >
                                <h3 style={{ margin: "0 0 16px 0", color: statusColor, fontSize: "1.25rem", fontWeight: "700" }}>{app.name}</h3>
                                <div style={{ display: "grid", gap: "10px" }}>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                                        <strong style={{ color: "#0f172a" }}>🆔 ID:</strong> {app.id}
                                    </p>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                        <strong style={{ color: "#0f172a" }}>📊 Status:</strong>{" "}
                                        <span
                                            style={{
                                                color: statusColor,
                                                fontWeight: "700",
                                            }}
                                        >
                                            {app.status === "APPROVED" && "✅ "}
                                            {app.status === "REJECTED" && "❌ "}
                                            {app.status === "PENDING" && "⏳ "}
                                            {app.status}
                                        </span>
                                    </p>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                        <strong style={{ color: "#0f172a" }}>🗳️ Votes:</strong> <span style={{ color: "#1e293b", fontWeight: "600" }}>{app.votes?.length || 0}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
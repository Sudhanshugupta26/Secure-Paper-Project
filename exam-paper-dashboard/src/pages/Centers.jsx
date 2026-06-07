import { useEffect, useState } from "react";
import API from "../api/client";

export default function Centers() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        API.get("/centers")
            .then((res) => {
                console.log("CENTERS:", res.data);
                setCenters(res.data);
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#0f172a" }}>🏫 Registered Centers</h1>
                <p style={{ color: "#475569", margin: "0" }}>View all exam centers in the consortium</p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <p>Loading centers...</p>
                </div>
            ) : centers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    <p>No centers found</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {centers.map((c) => {
                        const isActive = c.status === "ACTIVE" || c.status === "APPROVED";
                        const statusColor = isActive ? "#16a34a" : "#dc2626";
                        const glowColor = isActive ? "rgba(22, 163, 74, 0.04)" : "rgba(220, 38, 38, 0.04)";
                        return (
                            <div
                                key={c.id || c.centerId}
                                className="glass-card"
                                style={{
                                    border: `1px solid ${isActive ? "rgba(22, 163, 74, 0.15)" : "rgba(220, 38, 38, 0.15)"}`,
                                    padding: "24px",
                                    boxShadow: `0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 15px ${glowColor}`,
                                    wordBreak: "break-word",
                                }}
                            >
                                <h3 style={{ margin: "0 0 16px 0", color: isActive ? "#16a34a" : "#dc2626", fontSize: "1.25rem", fontWeight: "700" }}>{c.name}</h3>
                                <div style={{ display: "grid", gap: "10px" }}>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                                        <strong style={{ color: "#0f172a" }}>🆔 ID:</strong> {c.id || c.centerId}
                                    </p>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                        <strong style={{ color: "#0f172a" }}>📍 Location:</strong> {c.location || "MSP Peer Region"}
                                    </p>
                                    <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                        <strong style={{ color: "#0f172a" }}>📊 Status:</strong>{" "}
                                        <span
                                            style={{
                                                color: statusColor,
                                                fontWeight: "700",
                                            }}
                                        >
                                            {isActive ? "🟢 " : "🔴 "}
                                            {c.status}
                                        </span>
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
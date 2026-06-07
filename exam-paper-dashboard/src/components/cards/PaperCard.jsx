import { useState, useEffect } from "react";
import API from "../../api/client";

export default function PaperCard({ paper }) {
    const [timeRemaining, setTimeRemaining] = useState("");
    const [isLocked, setIsLocked] = useState(paper.status === "LOCKED");
    const [unlocking, setUnlocking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!paper.unlockTime || paper.status === "UNLOCKED") {
                setTimeRemaining("");
                setIsLocked(false);
                return;
            }

            const unlockDate = new Date(paper.unlockTime);
            const now = new Date();
            const diff = unlockDate - now;

            if (diff <= 0) {
                setTimeRemaining("");
                setIsLocked(false);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeRemaining(
                    `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
                setIsLocked(true);
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [paper]);

    const handleUnlock = async () => {
        setUnlocking(true);
        setError("");
        setSuccess("");
        try {
            const res = await API.post(`/papers/${paper.paperId}/unlock`);
            setSuccess(res.data.message || "🔓 Paper unlocked successfully!");
            setIsLocked(false);
        } catch (err) {
            setError(err.response?.data?.error || "Unlock failed");
        } finally {
            setUnlocking(false);
        }
    };

    const statusColor = isLocked ? "#dc2626" : "#16a34a";
    const bgGrad = isLocked
        ? "linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(255, 255, 255, 0.7) 100%)"
        : "linear-gradient(135deg, rgba(22, 163, 74, 0.05) 0%, rgba(255, 255, 255, 0.7) 100%)";
    const glowColor = isLocked ? "rgba(220, 38, 38, 0.05)" : "rgba(22, 163, 74, 0.05)";

    return (
        <div
            className="glass-card"
            style={{
                background: bgGrad,
                border: `1px solid ${isLocked ? "rgba(220, 38, 38, 0.15)" : "rgba(22, 163, 74, 0.15)"}`,
                padding: "24px",
                borderRadius: "16px",
                color: "#1e293b",
                position: "relative",
                boxShadow: `0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 15px 0 ${glowColor}`,
                wordBreak: "break-word",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <span style={{ fontSize: "1.5rem" }}>📄</span>
                        <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", letterSpacing: "-0.01em", wordBreak: "break-all", color: "#0f172a" }}>
                            {paper.paperId}
                        </h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                            <strong style={{ color: "#0f172a" }}>📌 Status:</strong>{" "}
                            <span style={{ color: statusColor, fontWeight: "700", fontSize: "1rem" }}>
                                {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
                            </span>
                        </p>
                        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                            <strong style={{ color: "#0f172a" }}>🏫 Uploaded By:</strong>{" "}
                            <span style={{ color: "#334155" }}>{paper.uploadedBy}</span>
                        </p>
                        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                            <strong style={{ color: "#0f172a" }}>⏰ Unlock Time:</strong>{" "}
                            <span style={{ color: "#334155" }}>{new Date(paper.unlockTime).toLocaleString()}</span>
                        </p>
                        {isLocked && (
                            <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                <strong style={{ color: "#0f172a" }}>⏳ Time Remaining:</strong>{" "}
                                <span
                                    style={{
                                        color: "#d97706",
                                        fontWeight: "700",
                                        fontSize: "1.1rem",
                                        fontFamily: "monospace",
                                        textShadow: "0 0 10px rgba(217, 119, 6, 0.15)",
                                    }}
                                >
                                    {timeRemaining}
                                </span>
                            </p>
                        )}
                    </div>

                    {isLocked && (
                        <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                            <button
                                onClick={handleUnlock}
                                disabled={unlocking}
                                style={{
                                    padding: "10px 20px",
                                    background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                                    border: "1px solid #d97706",
                                    color: "#ffffff",
                                    boxShadow: "0 4px 12px rgba(217, 119, 6, 0.2)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)";
                                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(217, 119, 6, 0.35)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.2)";
                                }}
                            >
                                {unlocking ? "⏳ Unlocking..." : "🔓 Unlock Paper"}
                            </button>
                            {error && <span style={{ color: "#dc2626", fontWeight: "600", fontSize: "0.95rem" }}>❌ {error}</span>}
                            {success && <span style={{ color: "#16a34a", fontWeight: "600", fontSize: "0.95rem" }}>✅ {success}</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import API from "../api/client";

export default function PrintPaper() {
    const [paperId, setPaperId] = useState("");
    const [centerId, setCenterId] = useState("");
    const [printKey, setPrintKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePrint = async () => {
        if (!paperId || !centerId || !printKey) {
            setMessage("❌ Please fill all fields");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const res = await API.post("/print", {
                paperId,
                centerId,
                printKey
            });

            setMessage("✅ " + (res.data.message || "Print successful"));
            setPaperId("");
            setCenterId("");
            setPrintKey("");
        } catch (err) {
            setMessage("❌ " + (err.response?.data?.error || "Print failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ maxWidth: "500px" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#0f172a" }}>🖨️ Print Exam Paper</h1>
                <p style={{ color: "#475569", marginBottom: "30px" }}>
                    Print exam papers securely with authentication
                </p>

                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "16px",
                        padding: "32px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 8px 32px 0 rgba(15, 23, 42, 0.04)"
                    }}
                >
                    <form onSubmit={(e) => { e.preventDefault(); handlePrint(); }}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem", color: "#334155" }}>
                                📄 Paper ID
                            </label>
                            <input
                                placeholder="Enter paper ID"
                                value={paperId}
                                onChange={(e) => setPaperId(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem", color: "#334155" }}>
                                🏫 Center ID
                            </label>
                            <input
                                placeholder="Enter center ID"
                                value={centerId}
                                onChange={(e) => setCenterId(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem", color: "#334155" }}>
                                🔑 Print Key
                            </label>
                            <input
                                type="password"
                                placeholder="Enter print key"
                                value={printKey}
                                onChange={(e) => setPrintKey(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {message && (
                            <div style={{
                                padding: "12px",
                                marginBottom: "16px",
                                borderRadius: "8px",
                                background: message.includes("✅") ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
                                color: message.includes("✅") ? "#16a34a" : "#dc2626"
                            }}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: loading ? "#cbd5e1" : "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {loading ? "⏳ Processing..." : "🖨️ Print Paper"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

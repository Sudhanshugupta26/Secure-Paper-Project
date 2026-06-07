import { useState } from "react";
import API from "../api/client";

export default function RegisterCenter() {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const submit = async () => {
        if (!id || !name) {
            setMessage("❌ Please fill all fields");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            await API.post("/centers/apply", { id, name });
            setMessage("✅ Application submitted successfully!");
            setId("");
            setName("");
        } catch (err) {
            setMessage("❌ Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ maxWidth: "500px" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "#0f172a" }}>📝 Apply for Consortium</h1>
                <p style={{ color: "#475569", marginBottom: "30px" }}>
                    Register a new exam center to join the consortium
                </p>

                <div
                    className="glass-card"
                    style={{
                        padding: "32px",
                        boxShadow: "0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 30px rgba(99, 102, 241, 0.04)",
                    }}
                >
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem", color: "#334155" }}>
                            🆔 Center ID
                        </label>
                        <input
                            placeholder="Enter unique center ID (e.g. CENTER_03)"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.95rem", color: "#334155" }}>
                            🏫 Center Name
                        </label>
                        <input
                            placeholder="Enter center name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button
                        onClick={submit}
                        disabled={loading}
                        style={{
                            width: "100%",
                        }}
                    >
                        {loading ? "⏳ Submitting..." : "✅ Submit Application"}
                    </button>

                    {message && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "14px",
                                borderRadius: "10px",
                                background: message.includes("✅")
                                    ? "rgba(16, 185, 129, 0.08)"
                                    : "rgba(220, 38, 38, 0.08)",
                                border: message.includes("✅")
                                    ? "1px solid rgba(16, 185, 129, 0.2)"
                                    : "1px solid rgba(220, 38, 38, 0.2)",
                                color: message.includes("✅") ? "#115e59" : "#991b1b",
                                fontWeight: "600",
                                wordBreak: "break-all"
                            }}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
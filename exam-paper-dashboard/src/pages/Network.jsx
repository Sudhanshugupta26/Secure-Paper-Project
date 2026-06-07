export default function Network() {
    const networkInfo = [
        { name: "Organization 1", msp: "Org1MSP", peer: "Peer0.org1", status: "✅ Active" },
        { name: "Organization 2", msp: "Org2MSP", peer: "Peer0.org2", status: "✅ Active" },
        { name: "Ordering Service", msp: "OrdererMSP", peer: "orderer.example.com", status: "✅ Active" },
    ];

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#0f172a" }}>🌐 Consortium Network</h1>
                <p style={{ color: "#475569", margin: "0" }}>View Hyperledger Fabric network topology</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {networkInfo.map((org, i) => (
                    <div
                        key={i}
                        className="glass-card"
                        style={{
                            border: "1px solid rgba(6, 182, 212, 0.18)",
                            padding: "24px",
                            boxShadow: "0 8px 32px 0 rgba(15, 23, 42, 0.04), 0 0 15px rgba(6, 182, 212, 0.03)",
                            wordBreak: "break-word",
                        }}
                    >
                        <h3 style={{ margin: "0 0 16px 0", color: "#0891b2", fontSize: "1.25rem", fontWeight: "700" }}>{org.name}</h3>
                        <div style={{ display: "grid", gap: "10px" }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                                <strong style={{ color: "#0f172a" }}>🏢 MSP:</strong> <span style={{ fontFamily: "monospace", color: "#16a34a", fontWeight: "600" }}>{org.msp}</span>
                            </p>
                            <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem", wordBreak: "break-all" }}>
                                <strong style={{ color: "#0f172a" }}>🔗 Peer:</strong> <span style={{ fontFamily: "monospace", color: "#16a34a", fontWeight: "600" }}>{org.peer}</span>
                            </p>
                            <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
                                <strong style={{ color: "#0f172a" }}>📊 Status:</strong> <span style={{ color: "#16a34a", fontWeight: "700" }}>{org.status}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Network Diagram */}
            <div className="glass-card" style={{ marginTop: "40px", padding: "30px", border: "1px solid rgba(15, 23, 42, 0.08)", boxShadow: "0 8px 32px 0 rgba(15, 23, 42, 0.04)" }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#4f46e5", fontSize: "1.3rem", fontWeight: "700" }}>🔗 Network Architecture</h3>
                <div style={{ fontFamily: "monospace", fontSize: "0.95rem", lineHeight: "1.8", color: "#475569" }}>
                    <p>┌─────────────────────────────────────────┐</p>
                    <p>│      Hyperledger Fabric Network         │</p>
                    <p>└─────────────────────────────────────────┘</p>
                    <p>           ↓         ↓         ↓</p>
                    <p style={{ color: "#16a34a", fontWeight: "bold" }}>   Org1MSP   Org2MSP   OrdererMSP</p>
                    <p>           ↓         ↓         ↓</p>
                    <p style={{ color: "#4f46e5", fontWeight: "bold" }}>  Peer0.org1 Peer0.org2 orderer.example.com</p>
                    <p>           ↓         ↓         ↓</p>
                    <p>  ┌─────────┴─────────┴─────────┘</p>
                    <p>  ↓</p>
                    <p style={{ color: "#d97706", fontWeight: "bold" }}>Exam Paper Channel</p>
                </div>
            </div>
        </div>
    );
}
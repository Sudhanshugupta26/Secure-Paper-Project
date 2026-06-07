import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(true);

    const navItems = [
        { path: "/", label: "Dashboard", icon: "📊" },
        { path: "/print", label: "Print Paper", icon: "🧾" },
        { path: "/centers", label: "Centers", icon: "🏫" },
        { path: "/network", label: "Consortium", icon: "🌐" },
        { path: "/apply", label: "Apply Center", icon: "📝" },
        { path: "/consortium", label: "Applications", icon: "🏛️" },
        { path: "/vote", label: "Voting", icon: "🗳️" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div
            style={{
                width: isExpanded ? "240px" : "76px",
                height: "100vh",
                background: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                color: "#334155",
                padding: "24px 12px",
                overflowY: "auto",
                borderRight: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "4px 0 24px rgba(15, 23, 42, 0.04)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isExpanded ? "space-between" : "center",
                    marginBottom: "32px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                }}
            >
                {isExpanded && (
                    <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.3rem" }}>🛡️</span>
                        <span className="gradient-text" style={{ fontWeight: "800", letterSpacing: "0.5px" }}>PAPER CHAIN</span>
                    </h2>
                )}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: "rgba(0, 0, 0, 0.03)",
                        border: "1px solid rgba(15, 23, 42, 0.1)",
                        borderRadius: "8px",
                        color: "#4f46e5",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        padding: "6px 10px",
                        boxShadow: "none",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
                        e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.03)";
                        e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.1)";
                    }}
                >
                    {isExpanded ? "◀" : "▶"}
                </button>
            </div>

            {/* Navigation */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                textDecoration: "none",
                                color: active ? "#4f46e5" : "#64748b",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background: active
                                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)"
                                    : "transparent",
                                border: active ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isExpanded ? "flex-start" : "center",
                                gap: "12px",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                whiteSpace: "nowrap",
                                fontSize: "0.95rem",
                                fontWeight: active ? "600" : "500",
                                boxShadow: active ? "0 4px 12px rgba(99, 102, 241, 0.04)" : "none",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.03)";
                                    e.currentTarget.style.color = "#0f172a";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#64748b";
                                }
                            }}
                        >
                            <span style={{ fontSize: "1.2rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                {item.icon}
                            </span>
                            {isExpanded && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
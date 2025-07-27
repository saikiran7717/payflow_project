import React from "react";
import { useAuth } from "../authContext.jsx";
import "../styles/navbar.css";
import { FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const palette = {
    accent: "#6366f1",
    teal: "#06b6d4",
    white: "#fff",
    dark: "#1a2233",
    gray: "#64748b",
    bg: "#f8fafc",
  };
  return (
    <nav
      className="navbar"
      style={{
        background: `linear-gradient(90deg, ${palette.bg} 80%, #e0e7ef 100%)`,
        boxShadow: "0 4px 18px 0 rgba(36,37,38,0.06)",
        padding: "18px 44px 16px 44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        borderBottom: `1.5px solid #e0e7ef`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <img src="/vite.svg" alt="logo" style={{ width: 44, height: 44, marginRight: 12, borderRadius: 12, boxShadow: "0 2px 8px #6366f122" }} />
        <h1 style={{ fontWeight: 900, fontSize: "2rem", color: palette.accent, letterSpacing: 1.2, textShadow: "0 2px 8px #6366f111", margin: 0 }}>PayFlow AI</h1>
      </div>
    </nav>
  );
}

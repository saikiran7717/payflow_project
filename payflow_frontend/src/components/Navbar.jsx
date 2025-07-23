import React from "react";
import { useAuth } from "../authContext.jsx";
import "../styles/navbar.css";
import { FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar" style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <img src="/vite.svg" alt="logo" style={{ width: 38, height: 38, marginRight: 10 }} />
        <h1 style={{ fontWeight: 800, fontSize: "1.7rem", color: "#1a2233", letterSpacing: 1 }}>PayFlow AI</h1>
      </div>
      <ul style={{ display: "flex", alignItems: "center", gap: 24, listStyle: "none", margin: 0 }}>
        <li><a href="/" style={{ fontWeight: 600, color: "#4fd1c5" }}>Home</a></li>
        {user && <li><button onClick={() => { logout(); window.location.href = '/login'; }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FaSignOutAlt /> Logout</button></li>}
      </ul>
    </nav>
  );
}

// src/pages/HRDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Layout.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../authContext.jsx";
import { FaSignOutAlt } from "react-icons/fa";

export default function HRDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      {/* HR Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "18px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src="/vite.svg" alt="logo" style={{ width: 38, height: 38, marginRight: 10 }} />
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1a2233" }}>HR Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontWeight: 600, color: "#1a2233" }}>Welcome, {user?.username || "HR"}</span>
          <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          <button onClick={() => { logout(); window.location.href = '/login'; }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FaSignOutAlt /> Logout</button>
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, padding: "2rem", width: "100%" , color: "black"}}>
          <h2 className="text-2xl font-semibold mb-4">HR Panel</h2>
          <p>Welcome {user?.username || "HR"}, manage your employee onboarding here.</p>
        </main>
      </div>
    </div>
  );
}

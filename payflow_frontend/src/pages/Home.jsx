import React from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1a2233" }}>PayFlow AI</h1>
        <p style={{ fontSize: "1.2rem", color: "#4fd1c5", marginTop: 16 }}>
          AI-Powered Payroll & Finance Management System
        </p>
        <div style={{ marginTop: 32 }}>
          <a href="/login" style={{
            background: "#4fd1c5",
            color: "#fff",
            padding: "12px 32px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "1.1rem"
          }}>Get Started</a>
        </div>
      </div>
    </div>
  );
}

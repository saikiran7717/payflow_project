import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async e => {
    e.preventDefault();
    setError(""); setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for session auth
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setMessage("Password reset successful! Please login with your new password.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      // Redirect to login after 2.5 seconds only on success
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div className="form-container" style={{
        maxWidth: 400,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        padding: 32,
        position: "relative",
        animation: "fadeIn 0.7s"
      }}>
        <h2 style={{ color: "#1a2233", fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Reset Password</h2>
        <form onSubmit={handleReset} aria-label="Set new password" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label htmlFor="old-password" style={{ fontWeight: 500, marginBottom: 4 }}>Current Password</label>
          <input id="old-password" type="password" placeholder="Current (Temp) Password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ marginBottom: 8, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Current Password" />
          <label htmlFor="new-password" style={{ fontWeight: 500, marginBottom: 4 }}>New Password</label>
          <input id="new-password" type="password" placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ marginBottom: 8, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="New Password" />
          <label htmlFor="confirm-password" style={{ fontWeight: 500, marginBottom: 4 }}>Confirm New Password</label>
          <input id="confirm-password" type="password" placeholder="Confirm New Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ marginBottom: 8, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} aria-required="true" aria-label="Confirm New Password" />
          <button type="submit" style={{
            background: loading ? "#b2f5ea" : "#4fd1c5",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "12px 0",
            width: "100%",
            fontWeight: 600,
            fontSize: "1.1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 2px 12px rgba(79,209,197,0.13)",
            transition: "background 0.2s"
          }} disabled={loading} aria-busy={loading} aria-label="Reset Password">
            {loading ? (
              <span className="spinner" style={{ width: 22, height: 22, border: "3px solid #b2f5ea", borderTop: "3px solid #4fd1c5", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8, display: "inline-block" }}></span>
            ) : null}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {error && <div role="alert" style={{ color: "#e53e3e", marginTop: 12, textAlign: "center", fontWeight: 600 }}>{error}</div>}
        {message && <div style={{ color: "#22c55e", marginTop: 12, textAlign: "center", fontWeight: 600 }}>{message}</div>}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
          Back to <a href="/login" style={{ color: "#4fd1c5", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#38bdf8"} onMouseOut={e => e.target.style.color = "#4fd1c5"}>Login</a>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .form-container {
            max-width: 98vw !important;
            margin: 16px auto !important;
            padding: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;

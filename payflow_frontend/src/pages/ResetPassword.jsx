import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";
import { FaLock, FaKey, FaShieldAlt, FaUser } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [oldPasswordFocused, setOldPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleReset = async e => {
    e.preventDefault();
    setError(""); setMessage("");
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", { position: "top-center" });
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
      toast.success("Password reset successful! Please login with your new password.", { position: "top-center" });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      // Redirect to login after 2.5 seconds only on success
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err) {
      toast.error(err.message || "Failed to reset password", { position: "top-center" });
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg,#e0f2fe 60%,#38bdf8 100%)",
      display: "flex",
      flexDirection: "column",
    }}>
      <Navbar style={{ width: "100%" }} />
      <div className="form-container"
        style={{
          maxWidth: 400,
          width: "100%",
          margin: "40px auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(56,189,248,0.13)",
          padding: "24px 32px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "auto",
        }}>
        <div style={{ position: "absolute", top: -24, right: -24, opacity: 0.10 }}>
          <FaShieldAlt style={{ fontSize: 70, color: "#38bdf8" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, justifyContent: "center" }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            boxShadow: "0 2px 8px #38bdf8",
            color: "white",
            fontSize: "1rem"
          }}>
            <FaUser />
          </div>
          <div>
            <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.25rem", marginBottom: 2 }}>Reset Password</h2>
            <div style={{ color: "#64748b", fontWeight: 500, fontSize: "0.95rem" }}>Set your new secure password</div>
          </div>
        </div>
        <form onSubmit={handleReset} aria-label="Reset password form" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Current Password input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaLock style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="old-password" 
              type="password" 
              placeholder="Current (Temp) Password" 
              required 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: oldPasswordFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="Current Password"
              onFocus={() => setOldPasswordFocused(true)}
              onBlur={() => setOldPasswordFocused(false)}
            />
          </div>
          
          {/* New Password input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaKey style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="new-password" 
              type="password" 
              placeholder="New Password" 
              required 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: newPasswordFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="New Password"
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
            />
          </div>
          
          {/* Confirm Password input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaShieldAlt style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="confirm-password" 
              type="password" 
              placeholder="Confirm New Password" 
              required 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: confirmPasswordFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="Confirm New Password"
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
            />
          </div>
          
          {/* Submit button */}
          <button type="submit" style={{
            background: loading ? "#bae6fd" : "#38bdf8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            width: "100%",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 2px 12px rgba(56,189,248,0.13)",
            transition: "background 0.2s"
          }} disabled={loading} aria-busy={loading} aria-label="Reset Password">
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, border: "3px solid #bae6fd", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}></span>
                Resetting...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaShieldAlt /> Reset Password
              </span>
            )}
          </button>
        </form>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.98rem", fontWeight: 500 }}>
          Back to <a href="/login" style={{ color: "#38bdf8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#0ea5e9"} onMouseOut={e => e.target.style.color = "#38bdf8"}>Login</a>
        </div>
        <ToastContainer />
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
            padding: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;

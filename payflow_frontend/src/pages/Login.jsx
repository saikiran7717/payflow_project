import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";
import { FaUserShield, FaUser, FaLock, FaSignInAlt, FaUserTie } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Clear any potential onboarding-related localStorage data
    localStorage.removeItem("onboarding_step");
    localStorage.removeItem("onboarding_data");
    
    let url;
    if (role === "admin") {
      url = "/api/admins/login";
    } else if (role === "employee") {
      url = "/api/employees/login";
    } else {
      url = "/api/users/login";
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        let errorMsg = "Incorrect email or password. Please try again.";
        
        if (res.status === 401) {
          // Handle invalid credentials - check this first
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || "Invalid email or password.";
          } catch (parseError) {
            errorMsg = "Invalid email or password.";
          }
          toast.error(errorMsg, { position: "top-center" });
          setError(errorMsg);
        } else if (res.status === 403) {
          // Handle account disabled case - check message to distinguish from auth failure
          try {
            const errorData = await res.json();
            // Only show disabled message if it specifically mentions disabled/blocked
            if (errorData.error && (errorData.error.toLowerCase().includes('disabled') || errorData.error.toLowerCase().includes('blocked'))) {
              errorMsg = errorData.error || "Your account is disabled. Please contact HR/Manager.";
            } else {
              errorMsg = "Invalid email or password.";
            }
          } catch (parseError) {
            errorMsg = "Invalid email or password.";
          }
          toast.error(errorMsg, { position: "top-center" });
          setError(errorMsg);
        } else {
          // Handle other errors
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorData.message || "Login failed. Please try again.";
          } catch (parseError) {
            errorMsg = "Login failed. Please try again.";
          }
          toast.error(errorMsg, { position: "top-center" });
          setError(errorMsg);
        }
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      // Add role information to the data for employee logins
      if (role === "employee") {
        data.role = "EMPLOYEE";
        data.isEmployee = true;
      }
      
      localStorage.setItem("payflow_user", JSON.stringify(data));
      toast.success("Login successful!", { position: "top-center" });
      setTimeout(() => {
        if (role === "admin") {
          console.log("Redirecting admin to /admin");
          window.location.href = "/admin";
        } else if (role === "employee") {
          if (data.requiresPasswordReset === true) {
            console.log("Employee needs password reset, redirecting to /reset");
            window.location.href = "/reset";
            return;
          }
          // Always redirect to employee dashboard - explicit logging
          console.log("Employee login successful, redirecting to /employee-dashboard");
          window.location.href = "/employee-dashboard";
        } else {
          if (data.requiresPasswordReset === true) {
            window.location.href = "/reset";
            return;
          }
          if (data.role === "HR") {
            window.location.href = "/hr";
          } else if (data.role === "MANAGER") {
            window.location.href = "/manager";
          } else {
            window.location.href = "/";
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
      toast.error("Network error. Please check your connection and try again.", { position: "top-center" });
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
          <FaSignInAlt style={{ fontSize: 70, color: "#38bdf8" }} />
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
            <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.25rem", marginBottom: 2 }}>Welcome Back!</h2>
            <div style={{ color: "#64748b", fontWeight: 500, fontSize: "0.95rem" }}>Sign in to your PayFlow account</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-label="Login form">
          {/* Role selection */}
          <div style={{ display: "flex", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
            <label htmlFor="role-user" style={{ flex: 1, minWidth: "80px", cursor: "pointer", fontWeight: 500, color: "#0f172a", background: role === "user" ? "#e0f2fe" : "transparent", borderRadius: 8, padding: "5px 8px", transition: "background 0.2s", fontSize: "0.9rem", textAlign: "center" }}>
              <input id="role-user" type="radio" name="role" value="user" checked={role === "user"} onChange={e => setRole(e.target.value)} style={{ marginRight: 5 }} aria-checked={role === "user"} aria-label="User (HR/Manager)" />
              <FaUser style={{ marginRight: 3, color: "#38bdf8" }} /> User
            </label>
            <label htmlFor="role-employee" style={{ flex: 1, minWidth: "80px", cursor: "pointer", fontWeight: 500, color: "#0f172a", background: role === "employee" ? "#e0f2fe" : "transparent", borderRadius: 8, padding: "5px 8px", transition: "background 0.2s", fontSize: "0.9rem", textAlign: "center" }}>
              <input id="role-employee" type="radio" name="role" value="employee" checked={role === "employee"} onChange={e => setRole(e.target.value)} style={{ marginRight: 5 }} aria-checked={role === "employee"} aria-label="Employee" />
              <FaUserTie style={{ marginRight: 3, color: "#10b981" }} /> Employee
            </label>
            <label htmlFor="role-admin" style={{ flex: 1, minWidth: "80px", cursor: "pointer", fontWeight: 500, color: "#0f172a", background: role === "admin" ? "#e0f2fe" : "transparent", borderRadius: 8, padding: "5px 8px", transition: "background 0.2s", fontSize: "0.9rem", textAlign: "center" }}>
              <input id="role-admin" type="radio" name="role" value="admin" checked={role === "admin"} onChange={e => setRole(e.target.value)} style={{ marginRight: 5 }} aria-checked={role === "admin"} aria-label="Admin" />
              <FaUserShield style={{ marginRight: 3, color: "#fbbf24" }} /> Admin
            </label>
          </div>
          {/* Email input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaUser style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input id="email" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 32, width: "100%", borderRadius: 8, border: emailFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", height: 36, fontSize: "1rem", background: "#fff", color: "#0f172a", boxShadow: "none", outline: "none", transition: "border 0.2s, background 0.2s" }} aria-required="true" aria-label="Email" onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
          </div>
          {/* Password input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaLock style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input id="password" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: 32, width: "100%", borderRadius: 8, border: passwordFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", height: 36, fontSize: "1rem", background: "#fff", color: "#0f172a", boxShadow: "none", outline: "none", transition: "border 0.2s, background 0.2s" }} aria-required="true" aria-label="Password" onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} />
          </div>
          {/* Submit button */}
          <button type="submit" style={{ background: loading ? "#bae6fd" : "#38bdf8", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", width: "100%", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 12px rgba(56,189,248,0.13)", transition: "background 0.2s" }} disabled={loading} aria-busy={loading} aria-label="Login">
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, border: "3px solid #bae6fd", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8 }}></span>
                Logging in...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaSignInAlt /> Login
              </span>
            )}
          </button>
        </form>
        <div className="form-links" style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: "0.98rem", fontWeight: 500 }}>
          <a href="/reset" style={{ color: "#38bdf8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#0ea5e9"} onMouseOut={e => e.target.style.color = "#38bdf8"}>Forgot Password?</a>
          <a href="/register" style={{ color: "#38bdf8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#0ea5e9"} onMouseOut={e => e.target.style.color = "#38bdf8"}>Register</a>
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
        /* Removed all custom Toastify popup styles, revert to default */
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
}

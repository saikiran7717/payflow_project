import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";
import { FaUserPlus, FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "admin" });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Submitting registration:", form);
    let url = "/api/admins/register";
    let body = { username: form.username, email: form.email, password: form.password };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Registration error response:", errorText);
        
        let errorMessage = "Registration failed";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response is not JSON, use the text directly
          if (errorText.includes("duplicate") || errorText.includes("already")) {
            errorMessage = "Email or username already exists. Please use a different one.";
          } else {
            errorMessage = errorText || "Registration failed";
          }
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setCreated(data);
      toast.success("Registration Successful!", { position: "top-center" });
      setForm({ username: "", email: "", password: "", role: "admin" });
    } catch (err) {
      setError(err.message || "Registration failed");
      toast.error("Registration failed! Please try again.", { position: "top-center" });
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
          <FaUserPlus style={{ fontSize: 70, color: "#38bdf8" }} />
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
            <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.25rem", marginBottom: 2 }}>Create Account</h2>
            <div style={{ color: "#64748b", fontWeight: 500, fontSize: "0.95rem" }}>Join PayFlow as Admin</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-label="Register form">
          {/* Username input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaUser style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="username" 
              name="username" 
              type="text" 
              placeholder="Full Name" 
              required 
              value={form.username} 
              onChange={handleChange} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: usernameFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="Full Name" 
              onFocus={() => setUsernameFocused(true)} 
              onBlur={() => setUsernameFocused(false)} 
            />
          </div>
          {/* Email input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaEnvelope style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Email" 
              required 
              value={form.email} 
              onChange={handleChange} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: emailFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="Email" 
              onFocus={() => setEmailFocused(true)} 
              onBlur={() => setEmailFocused(false)} 
            />
          </div>
          {/* Password input */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <FaLock style={{ position: "absolute", left: 12, top: 10, color: "#38bdf8" }} />
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Password" 
              required 
              value={form.password} 
              onChange={handleChange} 
              style={{ 
                paddingLeft: 32, 
                width: "100%", 
                borderRadius: 8, 
                border: passwordFocused ? "1.5px solid #0ea5e9" : "1.5px solid #38bdf8", 
                height: 36, 
                fontSize: "1rem", 
                background: "#fff", 
                color: "#0f172a", 
                boxShadow: "none", 
                outline: "none", 
                transition: "border 0.2s, background 0.2s" 
              }} 
              aria-required="true" 
              aria-label="Password" 
              onFocus={() => setPasswordFocused(true)} 
              onBlur={() => setPasswordFocused(false)} 
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
          }} disabled={loading} aria-busy={loading} aria-label="Register">
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, border: "3px solid #bae6fd", borderTop: "3px solid #38bdf8", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8 }}></span>
                Creating Account...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaUserPlus /> Create Account
              </span>
            )}
          </button>
        </form>
        {error && <div role="alert" style={{ color: "#e53e3e", marginTop: 12, textAlign: "center", fontWeight: 600 }}>{error}</div>}
        {created && (
          <div style={{ marginTop: 20, background: "#f1f5f9", padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#22c55e" }}>Registration Successful!</div>
            <div><b>Role:</b> Admin</div>
            <div><b>Email:</b> {created.email}</div>
            <div><b>Username:</b> {created.username}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
              You can now login with these credentials.
            </div>
          </div>
        )}
        <div className="form-links" style={{ marginTop: 18, display: "flex", justifyContent: "center", fontSize: "0.98rem", fontWeight: 500 }}>
          <a href="/login" style={{ color: "#38bdf8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#0ea5e9"} onMouseOut={e => e.target.style.color = "#38bdf8"}>Already have an account? Login</a>
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

export default RegisterPage;

import React, { useState } from "react";
import "../styles/form.css";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "admin" });
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Submitting registration:", form);
    let url = form.role === "admin" ? "/api/admins/register" : "/api/users/register";
    let body = form.role === "admin"
      ? { username: form.username, email: form.email, password: form.password }
      : { username: form.username, email: form.email, password: form.password, role: form.role.toUpperCase(), createdBy: 1 };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("duplicate")) {
          throw new Error("Email or username already exists. Please use a different one.");
        }
        throw new Error("Registration failed");
      }
      const data = await res.json();
      setCreated(data);
      toast.success("Registration Successful!");
      setForm({ username: "", email: "", password: "", role: "admin" });
    } catch (err) {
      setError(err.message || "Registration failed");
      toast.error("Registration Unsuccessful!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <ToastContainer />
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
        <h2 style={{ color: "#1a2233", fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Register</h2>
        <form onSubmit={handleSubmit} aria-label="Register form" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label htmlFor="role" style={{ fontWeight: 500, marginBottom: 4 }}>Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange} style={{
            marginBottom: 8,
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#000"
          }} aria-label="Role">
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
          </select>
          <label htmlFor="username" style={{ fontWeight: 500, marginBottom: 4 }}>Full Name</label>
          <input id="username" name="username" type="text" placeholder="Full Name" required value={form.username} onChange={handleChange} style={{
            marginBottom: 8,
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#000"
          }} aria-required="true" aria-label="Full Name" />
          <label htmlFor="email" style={{ fontWeight: 500, marginBottom: 4 }}>Email</label>
          <input id="email" name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} style={{
            marginBottom: 8,
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#000"
          }} aria-required="true" aria-label="Email" />
          <label htmlFor="password" style={{ fontWeight: 500, marginBottom: 4 }}>Password</label>
          <input id="password" name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} style={{
            marginBottom: 16,
            width: "100%",
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#000"
          }} aria-required="true" aria-label="Password" />
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
          }} disabled={loading} aria-busy={loading} aria-label="Register">
            {loading ? (
              <span className="spinner" style={{ width: 22, height: 22, border: "3px solid #b2f5ea", borderTop: "3px solid #4fd1c5", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8, display: "inline-block" }}></span>
            ) : null}
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {error && <div role="alert" style={{ color: "#e53e3e", marginTop: 12, textAlign: "center", fontWeight: 600 }}>{error}</div>}
        {created && (
          <div style={{ marginTop: 20, background: "#f1f5f9", padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#22c55e" }}>Registration Successful!</div>
            <div><b>Role:</b> {created.role || form.role}</div>
            <div><b>Email:</b> {created.email}</div>
            <div><b>Username:</b> {created.username}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
              You can now login with these credentials.
            </div>
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#4fd1c5", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#38bdf8"} onMouseOut={e => e.target.style.color = "#4fd1c5"}>Login</a>
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

export default RegisterPage;

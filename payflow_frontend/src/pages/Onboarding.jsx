import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/form.css";

export default function OnboardingForm() {
  const [form, setForm] = useState({ address: "", phone: "", department: "", joiningDate: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      // You may want to POST to /api/employees/onboard or similar endpoint
      // For demo, just show success
      setSuccess(true);
    } catch (err) {
      setError("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div className="form-container" style={{ maxWidth: 400, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32 }}>
        <h2 style={{ color: "#1a2233", fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Employee Onboarding</h2>
        <form onSubmit={handleSubmit}>
          <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" style={{ marginBottom: 16, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number" style={{ marginBottom: 16, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          <input name="department" value={form.department} onChange={handleChange} required placeholder="Department" style={{ marginBottom: 16, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} required style={{ marginBottom: 24, width: "100%", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
          <button type="submit" style={{ background: loading ? "#b2f5ea" : "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", width: "100%", fontWeight: 600, fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>{loading ? "Submitting..." : "Complete Onboarding"}</button>
        </form>
        {error && <div style={{ color: "#e53e3e", marginTop: 12, textAlign: "center" }}>{error}</div>}
        {success && <div style={{ color: "#22c55e", marginTop: 12, textAlign: "center" }}>Onboarding complete! Welcome to the company.</div>}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    totalExperience: "",
    pastExperience: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          age: Number(form.age),
          totalExperience: Number(form.totalExperience),
          pastExperience: form.pastExperience,
          passwordHash: form.password // backend should hash this!
        })
      });
      if (!res.ok) throw new Error("Failed to add employee");
      toast.success("Employee added successfully!");
      setForm({
        fullName: "",
        email: "",
        age: "",
        totalExperience: "",
        pastExperience: "",
        password: ""
      });
    } catch (err) {
      toast.error(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(120deg, #e0f7fa 0%, #f8fafc 100%)" }}>
      <Sidebar />
      <main style={{
        marginLeft: 220,
        padding: "2rem",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(79,209,197,0.13)",
          padding: "40px 32px",
          maxWidth: 420,
          width: "100%",
          border: "1px solid #e2e8f0"
        }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#2563eb",
            textAlign: "center",
            letterSpacing: 0.5
          }}>
            Add New Employee
          </h2>
          <form onSubmit={handleSubmit} aria-label="Add employee form" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label htmlFor="fullName" style={labelStyle}>Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Full Name"
              style={inputStyle}
            />
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
              placeholder="Email"
              style={inputStyle}
            />
            <label htmlFor="age" style={labelStyle}>Age</label>
            <input
              id="age"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              type="number"
              placeholder="Age"
              style={inputStyle}
            />
            <label htmlFor="totalExperience" style={labelStyle}>Total Experience (years)</label>
            <input
              id="totalExperience"
              name="totalExperience"
              value={form.totalExperience}
              onChange={handleChange}
              required
              type="number"
              placeholder="Total Experience"
              style={inputStyle}
            />
            <label htmlFor="pastExperience" style={labelStyle}>Past Experience (optional)</label>
            <textarea
              id="pastExperience"
              name="pastExperience"
              value={form.pastExperience}
              onChange={handleChange}
              placeholder="Past Experience"
              style={{ ...inputStyle, minHeight: 60 }}
            />
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              type="password"
              placeholder="Password"
              style={inputStyle}
            />
            <button
              type="submit"
              style={buttonStyle}
              disabled={
                !form.fullName.trim() ||
                !form.email.trim() ||
                !form.age ||
                !form.totalExperience ||
                !form.password
              }
              aria-busy={loading}
            >
              {loading ? (
                <span className="spinner" style={spinnerStyle}></span>
              ) : null}
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </form>
          {error && <div role="alert" style={{ marginTop: 20, color: "#ef4444", fontWeight: 600, textAlign: "center" }}>{error}</div>}

          {/* Toast Container for pop-up messages */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
      </main>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          main {
            margin-left: 0 !important;
            padding: 10px !important;
          }
          form {
            max-width: 98vw !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Reusable styles
const inputStyle = {
  width: "100%",
  marginBottom: 4,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #b2f5ea",
  background: "#f0f9ff",
  color: "#1a2233",
  fontWeight: 500,
  fontSize: "1rem"
};

const buttonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 0",
  width: "100%",
  fontWeight: 700,
  fontSize: "1.1rem",
  cursor: "pointer",
  marginTop: 8
};

const spinnerStyle = {
  width: 22,
  height: 22,
  border: "3px solid #b2f5ea",
  borderTop: "3px solid #2563eb",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
  marginRight: 8,
  display: "inline-block"
};

const labelStyle = {
  fontWeight: 600,
  marginBottom: 4,
  color: "#2563eb"
};

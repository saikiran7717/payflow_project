import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    totalExperience: "",
    pastExperience: "",
    password: "",
    address: "",
    phone: "",
    department: "",
    position: "",
    degree: "",
    university: "",
    graduationYear: "",
    grade: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = e => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = e => {
    e.preventDefault();
    setStep(1);
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
          passwordHash: form.password,
          address: form.address,
          phone: form.phone,
          department: form.department,
          position: form.position,
          degree: form.degree,
          university: form.university,
          graduationYear: form.graduationYear,
          grade: form.grade
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
        password: "",
        address: "",
        phone: "",
        department: "",
        position: "",
        degree: "",
        university: "",
        graduationYear: "",
        grade: ""
      });
      setStep(1);
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
          maxWidth: 500,
          width: "100%",
          border: "1px solid #e2e8f0"
        }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#2563eb",
            textAlign: "center"
          }}>
            Add New Employee
          </h2>

          <form onSubmit={step === 1 ? handleNext : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {step === 1 && (
              <>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} name="fullName" value={form.fullName} onChange={handleChange} required />

                <label style={labelStyle}>Email</label>
                <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} required />

                <label style={labelStyle}>Age</label>
                <input style={inputStyle} name="age" type="number" value={form.age} onChange={handleChange} required />

                <label style={labelStyle}>Total Experience</label>
                <input style={inputStyle} name="totalExperience" type="number" value={form.totalExperience} onChange={handleChange} required />

                <label style={labelStyle}>Past Experience</label>
                <textarea style={{ ...inputStyle, minHeight: 60 }} name="pastExperience" value={form.pastExperience} onChange={handleChange} />

                <label style={labelStyle}>Password</label>
                <input style={inputStyle} name="password" type="password" value={form.password} onChange={handleChange} required />
              </>
            )}

            {step === 2 && (
              <>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} name="address" value={form.address} onChange={handleChange} required />

                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} required />

                <label style={labelStyle}>Department</label>
                <input style={inputStyle} name="department" value={form.department} onChange={handleChange} required />

                <label style={labelStyle}>Position</label>
                <input style={inputStyle} name="position" value={form.position} onChange={handleChange} required />

                <label style={labelStyle}>Degree</label>
                <input style={inputStyle} name="degree" value={form.degree} onChange={handleChange} required />

                <label style={labelStyle}>University</label>
                <input style={inputStyle} name="university" value={form.university} onChange={handleChange} required />

                <label style={labelStyle}>Graduation Year</label>
                <input style={inputStyle} name="graduationYear" value={form.graduationYear} onChange={handleChange} required />

                <label style={labelStyle}>Grade / %</label>
                <input style={inputStyle} name="grade" value={form.grade} onChange={handleChange} required />
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              {step === 2 && (
                <button onClick={handleBack} style={{ ...buttonStyle, background: "#6b7280" }} type="button">
                  Back
                </button>
              )}
              <button
                type="submit"
                style={buttonStyle}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" style={spinnerStyle}></span>
                ) : null}
                {loading ? "Adding..." : step === 1 ? "Next" : "Add Employee"}
              </button>
            </div>
          </form>

          {error && <div style={{ marginTop: 20, color: "#ef4444", fontWeight: 600, textAlign: "center" }}>{error}</div>}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Styles
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
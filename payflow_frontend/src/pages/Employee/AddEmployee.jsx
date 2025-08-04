import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { FaHome, FaUser } from "react-icons/fa";
import { useAuth } from "../../authContext.jsx";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const palette = {
    accent: "#6366f1",
    dark: "#1e293b",
    bg: "#f1f5f9",
    white: "#fff",
  };

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
    address: "",
    degree: "",
    university: "",
    graduationYear: "",
    grade: "",
    position: "",
    pastExperiences: [
      { companyName: "", role: "", years: "" }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePastExpChange = (index, field, value) => {
    const updated = [...form.pastExperiences];
    updated[index][field] = value;
    setForm({ ...form, pastExperiences: updated });
  };

  const addPastExperience = () => {
    setForm({
      ...form,
      pastExperiences: [...form.pastExperiences, { companyName: "", role: "", years: "" }]
    });
  };

  const removePastExperience = index => {
    const updated = form.pastExperiences.filter((_, i) => i !== index);
    setForm({ ...form, pastExperiences: updated });
  };

  const validatePage1 = () => {
    return form.fullName && form.email && form.age && form.phone && form.address;
  };
  const validatePage2 = () => {
    // Require all education fields for page 2
    return form.degree && form.university && form.graduationYear && form.grade;
  };
  const validatePage3 = () => {
    // Position is required for page 3
    if (!form.position.trim()) return false;
    
    // Past experience is optional - we can have no experiences OR only complete experiences
    // Filter out completely empty experiences first
    const nonEmptyExperiences = form.pastExperiences.filter(exp => 
      exp.companyName.trim() || exp.role.trim() || exp.years.toString().trim()
    );
    
    // If no non-empty experiences, validation passes
    if (nonEmptyExperiences.length === 0) return true;
    
    // If there are non-empty experiences, they must all be complete
    return nonEmptyExperiences.every(exp => 
      exp.companyName.trim() && exp.role.trim() && exp.years.toString().trim()
    );
  };

  const handleNext = e => {
    e.preventDefault();
    if (
      (page === 1 && validatePage1()) ||
      (page === 2 && validatePage2())
    ) {
      setPage(page + 1);
    }
  };

  const handleBack = e => {
    e.preventDefault();
    if (page > 1) setPage(page - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validatePage3()) return;
    setLoading(true);
    try {
      // Filter out completely empty experiences and only keep fully complete ones
      const validExperiences = form.pastExperiences.filter(exp => 
        exp.companyName.trim() && exp.role.trim() && exp.years.toString().trim()
      );
      
      // Calculate totalExperience from valid experiences only
      const totalExperience = validExperiences.reduce((sum, exp) => {
        return sum + (Number(exp.years) || 0);
      }, 0);
      
      const res = await fetch("/api/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          totalExperience,
          pastExperiences: validExperiences.map(exp => ({
            companyName: exp.companyName,
            role: exp.role,
            years: Number(exp.years),
            yearsOfExperience: Number(exp.years)
          }))
        })
      });
      if (!res.ok) throw new Error("Failed to add employee");
      toast.success("Employee added successfully!");
      
      // Reset form
      setForm({
        fullName: "",
        email: "",
        age: "",
        phone: "",
        address: "",
        degree: "",
        university: "",
        graduationYear: "",
        grade: "",
        position: "",
        pastExperiences: [{ companyName: "", role: "", years: "" }]
      });
      setPage(1);
      
      // Redirect to employee list after short delay to show toast
      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const pages = [
    // Page 1: Personal Details
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Personal Details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Email</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Age</label>
          <input name="age" value={form.age} onChange={handleChange} type="number" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / span 2", display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Address</label>
          <input name="address" value={form.address} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
    </div>,
    // Page 2: Education (all fields)
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Education</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Degree</label>
          <input name="degree" value={form.degree} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>University</label>
          <input name="university" value={form.university} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Graduation Year</label>
          <input name="graduationYear" value={form.graduationYear} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Grade</label>
          <input name="grade" value={form.grade} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
    </div>,
    // Page 3: Position and Past Experience
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Position & Experience</h3>
      
      {/* Position Field */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Position</label>
        <input 
          name="position" 
          value={form.position} 
          onChange={handleChange} 
          placeholder="Enter job position/title"
          style={inputStyle} 
        />
      </div>

      {/* Past Experience Section */}
      <div style={{ marginTop: 8 }}>
        <h4 style={{ fontWeight: 600, fontSize: "1.1rem", color: "#6366f1", marginBottom: 12 }}>Past Experience (Optional)</h4>
        {form.pastExperiences.map((exp, index) => (
          <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input placeholder="Company" value={exp.companyName} onChange={e => handlePastExpChange(index, "companyName", e.target.value)} style={{ ...inputStyle, flex: 2 }} />
            <input placeholder="Role" value={exp.role} onChange={e => handlePastExpChange(index, "role", e.target.value)} style={{ ...inputStyle, flex: 2 }} />
            <input placeholder="Years" type="number" min="0" max="50" value={exp.years} onChange={e => handlePastExpChange(index, "years", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            {form.pastExperiences.length > 1 && (
              <button onClick={() => removePastExperience(index)} type="button" style={{ ...buttonStyle, background: "#f87171", marginTop: 0, height: 38 }}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={addPastExperience} type="button" style={{ ...buttonStyle, background: "#22d3ee", marginBottom: 12 }}>
          + Add Experience
        </button>
      </div>
    </div>
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: palette.white,
          padding: "22px 40px 18px 40px",
          boxShadow: "0 4px 18px 0 rgba(36,37,38,0.06)",
          borderBottom: `1.5px solid ${palette.bg}`,
        }}
      >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: palette.accent,
                display: "flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: 0.5,
              }}
            >
              <FaHome /> HR Dashboard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ fontWeight: 700, color: palette.dark, fontSize: "1.1rem" }}>
              {user?.username ? `Welcome, ${user.username}` : "Welcome, HR"}
            </span>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${palette.accent} 0%, #8b5cf6 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2.5px solid ${palette.accent}`,
                color: palette.white,
                fontSize: "1.2rem",
              }}
            >
              <FaUser />
            </div>
            <span
              style={{
                fontWeight: 700,
                color: palette.accent,
                fontSize: "1.25rem",
                background: "linear-gradient(90deg, #f1f5f9 60%, #e0e7ef 100%)",
                borderRadius: 8,
                padding: "6px 18px",
                boxShadow: "0 2px 8px #6366f122",
                fontFamily: "monospace",
                minWidth: 110,
                textAlign: "center",
                border: `1.5px solid ${palette.accent}22`,
              }}
            >
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </nav>

        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <main style={{ padding: "2.5rem 3rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 800, background: "#fff", padding: "3rem", borderRadius: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 24, color: "#1e293b" }}>Add Employee</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {pages[page - 1]}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              {page > 1 && <button type="button" onClick={handleBack} style={buttonStyle}>Back</button>}
              {page < pages.length && (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    ...buttonStyle,
                    opacity: (page === 1 && !validatePage1()) || (page === 2 && !validatePage2()) ? 0.6 : 1,
                    pointerEvents: (page === 1 && !validatePage1()) || (page === 2 && !validatePage2()) ? "none" : "auto"
                  }}
                  disabled={(page === 1 && !validatePage1()) || (page === 2 && !validatePage2())}
                >
                  Next
                </button>
              )}
              {page === pages.length && (
                <button type="submit" disabled={loading || !validatePage3()} style={buttonStyle}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
        </div>
        <ToastContainer />
      </main>
    </div>
  </div>
  );
}

// Reusable styles
const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1.5px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  width: "100%",
  fontSize: "1rem",
  color: "#111"
};

const buttonStyle = {
  background: "#6366f1",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer"
};

const labelStyle = {
  fontWeight: 600,
  fontSize: "1rem",
  marginBottom: 4,
  color: "#334155"
};

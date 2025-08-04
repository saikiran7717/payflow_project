import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import DynamicNavigation from "../../components/DynamicNavigation";
import { ToastContainer, toast } from "react-toastify";
import { FaHome, FaUser } from "react-icons/fa";
import { useAuth } from "../../authContext.jsx";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Fetch managers and current user role when component mounts
    fetchCurrentUserRole();
    fetchManagers();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
      const res = await fetch("/api/employees/current-user-role");
      if (res.ok) {
        const userData = await res.json();
        console.log("User data received:", userData); // Debug log
        setCurrentUserRole(userData.role);
        setCurrentUser(userData);
        
        // If user is a manager, auto-set managerId to themselves
        if (userData.role === "MANAGER") {
          setForm(prev => ({ ...prev, managerId: userData.userId }));
        }
      } else {
        console.error("Failed to fetch user role:", res.status);
        // Fallback: assume HR role if API fails
        setCurrentUserRole("HR");
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
      // Fallback: assume HR role if network error
      setCurrentUserRole("HR");
    }
  };

  const fetchManagers = async () => {
    setManagersLoading(true);
    try {
      const res = await fetch("/api/employees/managers");
      if (res.ok) {
        const managersData = await res.json();
        console.log("Managers data received:", managersData); // Debug log
        setManagers(managersData);
      } else {
        console.error("Failed to fetch managers:", res.status);
        setManagers([]); // Set empty array if API fails
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]); // Set empty array if network error
    } finally {
      setManagersLoading(false);
    }
  };

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
    gender: "",
    degree: "",
    university: "",
    graduationYear: "",
    grade: "",
    designation: "",
    department: "",
    totalLeaves: "",
    managerId: "",
    pastExperiences: [
      { companyName: "", role: "", years: "" }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
    return form.fullName && form.email && form.age && form.phone && form.address && form.gender;
  };
  const validatePage2 = () => {
    // Require all education fields for page 2
    return form.degree && form.university && form.graduationYear && form.grade;
  };
  const validatePage3 = () => {
    // Designation, department and totalLeaves are always required
    if (!form.designation.trim() || !form.department.trim() || !form.totalLeaves.trim()) return false;
    
    // Manager validation based on role
    if (currentUserRole === "HR") {
      // HR must select a manager
      if (!form.managerId.trim()) return false;
    }
    // For MANAGER role, managerId is auto-set, so no validation needed
    
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
      
      const employeeData = {
        fullName: form.fullName,
        email: form.email,
        age: Number(form.age),
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        degree: form.degree,
        university: form.university,
        graduationYear: form.graduationYear,
        grade: form.grade,
        designation: form.designation,
        department: form.department, // Explicitly include department
        totalLeaves: Number(form.totalLeaves),
        remLeaves: Number(form.totalLeaves), // Initially same as totalLeaves
        totalExperience,
        managerId: Number(form.managerId),
        pastExperiences: validExperiences.map(exp => ({
          companyName: exp.companyName,
          role: exp.role,
          years: Number(exp.years),
          yearsOfExperience: Number(exp.years)
        }))
      };
      
      console.log("Sending employee data to backend:", employeeData); // Debug log
      
      const res = await fetch("/api/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData)
      });
      if (!res.ok) throw new Error("Failed to add employee");
      toast.success("Employee added successfully!");
      
      // Reset form
      const resetForm = {
        fullName: "",
        email: "",
        age: "",
        phone: "",
        address: "",
        gender: "",
        degree: "",
        university: "",
        graduationYear: "",
        grade: "",
        designation: "",
        department: "",
        totalLeaves: "",
        managerId: currentUserRole === "MANAGER" ? currentUser?.userId || "" : "",
        pastExperiences: [{ companyName: "", role: "", years: "" }]
      };
      setForm(resetForm);
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
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
    // Page 3: Designation and Past Experience
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Designation & Experience</h3>
      
      {/* Designation, Department, Manager and Total Leaves Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Designation</label>
          <input 
            name="designation" 
            value={form.designation} 
            onChange={handleChange} 
            placeholder="Enter job designation/title"
            style={inputStyle} 
          />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Department</label>
          <select 
            name="department" 
            value={form.department} 
            onChange={handleChange} 
            style={inputStyle}
          >
            <option value="">Select Department</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="IT">IT</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Legal">Legal</option>
            <option value="Research & Development">Research & Development</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Product Management">Product Management</option>
          </select>
        </div>
        
        {/* Manager Selection - Conditional based on role */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Manager</label>
          {currentUserRole === "HR" ? (
            <select 
              name="managerId" 
              value={form.managerId} 
              onChange={handleChange} 
              style={inputStyle}
              disabled={managersLoading}
            >
              <option value="">
                {managersLoading ? "Loading managers..." : "Select a Manager"}
              </option>
              {!managersLoading && managers.length > 0 ? (
                managers.map(manager => (
                  <option key={manager.userId || manager.id} value={manager.userId || manager.id}>
                    {manager.username || manager.name || manager.fullName} ({manager.email})
                  </option>
                ))
              ) : !managersLoading && managers.length === 0 ? (
                <option disabled>No managers available</option>
              ) : null}
            </select>
          ) : currentUserRole === "MANAGER" ? (
            <div style={{
              ...inputStyle,
              backgroundColor: "#f0f0f0",
              color: "#666",
              display: "flex",
              alignItems: "center"
            }}>
              {currentUser?.username || currentUser?.name || "Manager"} (You) - Auto-assigned
            </div>
          ) : currentUserRole === null ? (
            <div style={{
              ...inputStyle,
              backgroundColor: "#f0f0f0",
              color: "#666",
              display: "flex",
              alignItems: "center"
            }}>
              Loading user role...
            </div>
          ) : (
            // Fallback for unknown roles - treat as HR
            <select 
              name="managerId" 
              value={form.managerId} 
              onChange={handleChange} 
              style={inputStyle}
              disabled={managersLoading}
            >
              <option value="">
                {managersLoading ? "Loading managers..." : "Select a Manager"}
              </option>
              {!managersLoading && managers.length > 0 ? (
                managers.map(manager => (
                  <option key={manager.userId || manager.id} value={manager.userId || manager.id}>
                    {manager.username || manager.name || manager.fullName} ({manager.email})
                  </option>
                ))
              ) : !managersLoading && managers.length === 0 ? (
                <option disabled>No managers available</option>
              ) : null}
            </select>
          )}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10, gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Total Leaves Per Year</label>
          <input 
            name="totalLeaves" 
            value={form.totalLeaves} 
            onChange={handleChange} 
            type="number"
            min="0"
            max="365"
            placeholder="Enter total leaves per year"
            style={inputStyle} 
          />
        </div>
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
      <DynamicNavigation />

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

import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaHome, FaUser, FaSignOutAlt, FaFileAlt, FaInfoCircle, FaPaperPlane } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const palette = {
  blue: "#93c5fd",      // subtle blue (same as admin)
  teal: "#99f6e4",      // subtle teal (same as admin)
  yellow: "#fde68a",    // subtle yellow (same as admin)
  orange: "#fdba74",    // subtle orange (same as admin)
  red: "#ef4444",       // bright red (same as admin)
  green: "#22c55e",     // bright green (same as admin)
  purple: "#ddd6fe",    // subtle purple (same as admin)
  gray: "#9ca3af",      // darker gray for better visibility
  dark: "#374151",      // darker text for better readability
  darkest: "#1f2937",   // darkest text for high contrast
  light: "#f8fafc",     // same as admin
  accent: "#6366f1",    // same as admin
  bg: "#f1f5f9",        // same as admin
  white: "#fff",        // same as admin
};

// Employee Sidebar Component - Styled like HR Dashboard Sidebar
const EmployeeSidebar = ({ activePage = "apply-leave" }) => {
  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout API failed", err);
    }
    localStorage.removeItem("payflow_user");
    window.location.href = "/login";
  };

  const linkStyle = (path) => ({
    display: "block",
    padding: "13px 36px",
    fontWeight: 700,
    textDecoration: "none",
    background: activePage === path ? palette.accent + "22" : "transparent",
    color: activePage === path ? palette.accent : palette.dark,
    borderLeft: activePage === path ? `4px solid ${palette.accent}` : "4px solid transparent",
    borderRadius: activePage === path ? "0 18px 18px 0" : "0 18px 18px 0",
    margin: "2px 0",
    fontSize: "1.08rem",
    letterSpacing: 0.2,
    transition: "background 0.18s, color 0.18s",
  });

  return (
    <aside
      style={{
        background: "linear-gradient(120deg, #f8fafc 80%, #e0e7ef 100%)",
        minWidth: 230,
        boxShadow: "0 6px 24px 0 rgba(36,37,38,0.07)",
        padding: "38px 0 32px 0",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        borderRight: "1.5px solid #e0e7ef",
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <div style={{ width: "100%" }}>
        <h2
          style={{
            fontWeight: 900,
            fontSize: "1.7rem",
            color: palette.accent,
            marginBottom: 36,
            textAlign: "center",
            letterSpacing: 1.2,
            textShadow: "0 2px 8px #6366f111"
          }}
        >
          PayFlow AI
        </h2>
        <nav style={{ width: "100%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
            <li>
              <a href="/employee-dashboard" style={linkStyle("dashboard")}>
                Dashboard
              </a>
            </li>
            <li>
              <a href="/apply-leave" style={linkStyle("apply-leave")}>
                Apply Leave
              </a>
            </li>
            <li>
              <a href="/leaves-info" style={linkStyle("leaves-info")}>
                Leaves Info
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                style={{
                  background: `linear-gradient(90deg, ${palette.red} 60%, #f87171 100%)`,
                  color: palette.white,
                  border: "none",
                  borderRadius: 10,
                  padding: "13px 32px",
                  width: "100%",
                  textAlign: "left",
                  fontSize: "1.13rem",
                  marginTop: 22,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 2px 8px #ef444422",
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  transition: "background 0.2s",
                }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default function ApplyLeave() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get employee data from localStorage or fetch from API
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const userData = localStorage.getItem("payflow_user");
        if (userData) {
          const user = JSON.parse(userData);
          console.log("Using employee data from localStorage:", user);
          
          // Enhance user data with leave information if missing
          const enhancedUser = {
            ...user,
            totalLeaves: user.totalLeaves || 25,
            remLeaves: user.remLeaves || (user.totalLeaves ? user.totalLeaves - 5 : 20),
            employeeId: user.employeeId || user.id || 1,
            fullName: user.fullName || user.name || user.firstName || "Employee",
          };
          
          setEmployee(enhancedUser);
          return;
        } else {
          // Fallback to API call if no localStorage data
          console.log("No localStorage data, fetching from API...");
          const res = await fetch("/api/employees/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (res.ok) {
            const data = await res.json();
            console.log("Employee data fetched from API:", data);
            
            // Enhance API data
            const enhancedData = {
              ...data,
              totalLeaves: data.totalLeaves || 25,
              remLeaves: data.remLeaves || 20,
            };
            
            setEmployee(enhancedData);
            localStorage.setItem("payflow_user", JSON.stringify(enhancedData));
          } else if (res.status === 403) {
            toast.error("Access denied. Using default data for development.", { position: "top-center" });
            
            // Use mock data for development
            const mockEmployee = {
              employeeId: 1,
              id: 1,
              fullName: "John Doe",
              name: "John Doe",
              email: "john.doe@company.com",
              totalLeaves: 25,
              remLeaves: 15,
            };
            setEmployee(mockEmployee);
          }
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
        toast.error("Error loading employee data", { position: "top-center" });
        
        // Fallback data
        const fallbackEmployee = {
          employeeId: 1,
          fullName: "Employee",
          totalLeaves: 25,
          remLeaves: 18,
        };
        setEmployee(fallbackEmployee);
      }
    };

    fetchEmployeeData();
  }, []);

  const validateDates = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates", { position: "top-center" });
      return false;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for your leave", { position: "top-center" });
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      toast.error("Start date cannot be in the past", { position: "top-center" });
      return false;
    }
    
    if (end < start) {
      toast.error("End date must be after start date", { position: "top-center" });
      return false;
    }
    
    return true;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) return;
    
    if (!employee?.employeeId && !employee?.id) {
      toast.error("Employee information not found. Please login again.", { position: "top-center" });
      return;
    }

    setLoading(true);
    
    try {
      const employeeId = employee.employeeId || employee.id;
      const response = await fetch(`/api/leaves/apply/${employeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
          reason: reason.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Leave application submitted successfully!", { position: "top-center" });
        setStartDate("");
        setEndDate("");
        setReason("");
        console.log("Leave applied:", result);
      } else if (response.status === 403) {
        toast.error("Access denied. Please login again.", { position: "top-center" });
        setTimeout(() => {
          localStorage.removeItem("payflow_user");
          window.location.href = "/login";
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error("Leave application failed:", errorText);
        toast.error(errorText || "Failed to apply for leave", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error applying for leave:", error);
      toast.error("Error applying for leave. Please try again.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

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
            <FaFileAlt /> Apply Leave
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontWeight: 700, color: palette.darkest, fontSize: "1.1rem", letterSpacing: 0.2 }}>
            {employee?.fullName || employee?.name || employee?.firstName || "Welcome, Employee"}
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
              letterSpacing: 1.5,
              background: "linear-gradient(90deg, #f1f5f9 60%, #e0e7ef 100%)",
              borderRadius: 8,
              padding: "6px 18px",
              boxShadow: "0 2px 8px #6366f122",
              fontFamily: "monospace, 'Roboto Mono', 'Fira Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
              minWidth: 110,
              textAlign: "center",
              border: `1.5px solid ${palette.accent}22`,
              marginLeft: 8,
              transition: "background 0.2s",
            }}
          >
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1 }}>
        <EmployeeSidebar activePage="apply-leave" />
        <main style={{ 
          padding: "2.5rem 2rem", 
          width: "100%", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-start" 
        }}>
          <div
            style={{
              background: palette.white,
              borderRadius: 20,
              boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
              padding: 36,
              border: `1.5px solid ${palette.accent}22`,
              width: "100%",
              maxWidth: "650px",
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: palette.accent,
                fontSize: "1.5rem",
                letterSpacing: 0.2,
              }}
            >
              <FaPaperPlane /> Leave Application Form
            </h2>

            <form onSubmit={handleApplyLeave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
                <div style={{ width: "40%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      color: palette.darkest,
                      fontSize: "1rem",
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1px solid ${palette.gray}`,
                      borderRadius: 12,
                      fontSize: "1rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                      backgroundColor: palette.light,
                      color: palette.darkest,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = palette.accent)}
                    onBlur={(e) => (e.target.style.borderColor = palette.gray)}
                  />
                </div>

                <div style={{ width: "40%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      color: palette.darkest,
                      fontSize: "1rem",
                    }}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1px solid ${palette.gray}`,
                      borderRadius: 12,
                      fontSize: "1rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                      backgroundColor: palette.light,
                      color: palette.darkest,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = palette.accent)}
                    onBlur={(e) => (e.target.style.borderColor = palette.gray)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "80%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      color: palette.darkest,
                      fontSize: "1rem",
                    }}
                  >
                    Reason for Leave *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed reason for your leave application..."
                    required
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1px solid ${palette.gray}`,
                      borderRadius: 12,
                      fontSize: "1rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                      backgroundColor: palette.light,
                      color: palette.darkest,
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = palette.accent)}
                    onBlur={(e) => (e.target.style.borderColor = palette.gray)}
                  />
                  <div style={{ 
                    fontSize: "0.85rem", 
                    color: palette.gray, 
                    marginTop: 4,
                    textAlign: "right" 
                  }}>
                    {reason.length}/500 characters
                  </div>
                </div>
              </div>

              {startDate && endDate && (
                <div
                  style={{
                    background: `linear-gradient(120deg, ${palette.bg} 80%, #e0e7ef 100%)`,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.accent}33`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <FaCalendarAlt style={{ color: palette.accent }} />
                    <strong style={{ color: palette.accent }}>Leave Summary:</strong>
                  </div>
                  <div style={{ color: palette.darkest, fontWeight: 600 }}>
                    Duration: {calculateLeaveDays()} day(s) ({startDate} to {endDate})
                  </div>
                  {employee?.remLeaves && (
                    <div style={{ color: palette.dark, fontSize: "0.9rem", marginTop: 4 }}>
                      Remaining leaves: {employee.remLeaves}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? palette.gray : `linear-gradient(135deg, ${palette.accent} 0%, #4f46e5 100%)`,
                  color: palette.white,
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 24px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transition: "all 0.2s",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(99,102,241,0.4)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderTop: "3px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Submit Leave Application
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>

      <ToastContainer />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Style the calendar icon in date inputs */
        input[type="date"]::-webkit-calendar-picker-indicator {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23000000'%3e%3cpath fill-rule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clip-rule='evenodd'/%3e%3c/svg%3e");
          background-size: 16px 16px;
          background-repeat: no-repeat;
          background-position: center;
          width: 20px;
          height: 20px;
          cursor: pointer;
          opacity: 1;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        /* For Firefox */
        input[type="date"] {
          color-scheme: light;
        }
      `}</style>
    </div>
  );
}

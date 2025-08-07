import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/DynamicNavigation.jsx";
import EmployeeSidebar from "../components/EmployeeSidebar.jsx";
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

    // Calculate requested leave days
    const requestedDays = calculateLeaveDays();
    
    // Get current month and year for validation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();
    
    // Check if employee has sufficient remaining leaves
    if (employee?.remLeaves !== undefined && requestedDays > employee.remLeaves) {
      // Check if the extra days can be taken (only in current month)
      const isStartInCurrentMonth = startMonth === currentMonth && startYear === currentYear;
      const isEndInCurrentMonth = endMonth === currentMonth && endYear === currentYear;
      
      if (!isStartInCurrentMonth || !isEndInCurrentMonth) {
        toast.error(
          `Insufficient remaining leaves. You have ${employee.remLeaves} days remaining but requesting ${requestedDays} days. Extra leaves can only be taken within the current month.`, 
          { 
            position: "top-center",
            autoClose: 8000 // Show longer for important information
          }
        );
        return false;
      } else {
        // Show warning but allow submission for current month
        const extraDays = requestedDays - employee.remLeaves;
        toast.warning(
          `You are requesting ${extraDays} extra days beyond your remaining leaves. This will be tracked as extra leaves for this month.`, 
          { 
            position: "top-center",
            autoClose: 6000
          }
        );
      }
    }
    
    // Check if employee has no remaining leaves
    if (employee?.remLeaves === 0) {
      const isStartInCurrentMonth = startMonth === currentMonth && startYear === currentYear;
      const isEndInCurrentMonth = endMonth === currentMonth && endYear === currentYear;
      
      if (!isStartInCurrentMonth || !isEndInCurrentMonth) {
        toast.error(
          `You have no remaining leaves. Extra leaves can only be taken within the current month.`, 
          { 
            position: "top-center",
            autoClose: 6000
          }
        );
        return false;
      }
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
      
      // Check for existing leave applications on the same date range
      console.log("Checking for existing leave applications...");
      const existingLeavesResponse = await fetch(`/api/leaves/${employeeId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (existingLeavesResponse.ok) {
        const existingLeaves = await existingLeavesResponse.json();
        console.log("Existing leaves:", existingLeaves);
        
        // Check if there's any overlap with existing leave applications
        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);
        
        const hasOverlap = existingLeaves.some(leave => {
          // Skip rejected leaves
          if (leave.status?.toLowerCase() === 'rejected') {
            return false;
          }
          
          const existingStartDate = new Date(leave.startDate);
          const existingEndDate = new Date(leave.endDate);
          
          // Check for any date overlap
          const isOverlapping = (
            (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
            (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
            (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
          );
          
          if (isOverlapping) {
            console.log(`Overlap found with existing leave: ${leave.startDate} to ${leave.endDate} (Status: ${leave.status})`);
          }
          
          return isOverlapping;
        });

        if (hasOverlap) {
          toast.error("You already have a leave application for the selected date range. Please choose different dates.", { 
            position: "top-center",
            autoClose: 5000
          });
          setLoading(false);
          return;
        }
      } else {
        console.warn("Could not fetch existing leaves for validation, proceeding with application");
      }
      
      // Proceed with leave application if no overlap found
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
        // Handle error response properly
        let errorMessage = "Failed to apply for leave";
        
        try {
          // Try to parse as JSON first (for our custom error responses)
          const errorData = await response.json();
          
          if (errorData.type === "INSUFFICIENT_LEAVES") {
            errorMessage = `Cannot apply for leave: You have only ${errorData.remainingLeaves} remaining leaves but requested ${errorData.requestedLeaves} days.`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If JSON parsing fails, try to get as text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            // Use default error message if both JSON and text parsing fail
            console.error("Error parsing error response:", textError);
          }
        }
        
        console.error("Leave application failed:", errorMessage);
        toast.error(errorMessage, { 
          position: "top-center",
          autoClose: 6000 // Show error longer for important messages
        });
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
      <DynamicNavigation />

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
                  {employee?.remLeaves !== undefined && (
                    <>
                      <div style={{ color: palette.dark, fontSize: "0.9rem", marginTop: 4 }}>
                        Remaining leaves: {employee.remLeaves}
                      </div>
                      {calculateLeaveDays() > employee.remLeaves && (
                        <>
                          {/* Check if dates are in current month */}
                          {(() => {
                            const currentDate = new Date();
                            const currentMonth = currentDate.getMonth();
                            const currentYear = currentDate.getFullYear();
                            
                            const start = new Date(startDate);
                            const end = new Date(endDate);
                            const startMonth = start.getMonth();
                            const startYear = start.getFullYear();
                            const endMonth = end.getMonth();
                            const endYear = end.getFullYear();
                            
                            const isCurrentMonth = (startMonth === currentMonth && startYear === currentYear) && 
                                                   (endMonth === currentMonth && endYear === currentYear);
                            
                            const extraDays = calculateLeaveDays() - employee.remLeaves;
                            
                            if (isCurrentMonth) {
                              return (
                                <div 
                                  style={{ 
                                    color: palette.orange, 
                                    fontSize: "0.9rem", 
                                    marginTop: 8,
                                    fontWeight: 600,
                                    padding: "8px 12px",
                                    background: `${palette.orange}11`,
                                    borderRadius: 8,
                                    border: `1px solid ${palette.orange}33`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                  }}
                                >
                                  <FaInfoCircle />
                                  ℹ️ Note: {extraDays} extra days will be tracked for this month (allowed since leave is within current month).
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  style={{ 
                                    color: palette.red, 
                                    fontSize: "0.9rem", 
                                    marginTop: 8,
                                    fontWeight: 600,
                                    padding: "8px 12px",
                                    background: `${palette.red}11`,
                                    borderRadius: 8,
                                    border: `1px solid ${palette.red}33`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                  }}
                                >
                                  <FaInfoCircle />
                                  ⚠️ Error: Extra leaves ({extraDays} days) can only be taken within the current month.
                                </div>
                              );
                            }
                          })()}
                        </>
                      )}
                      {employee.remLeaves === 0 && (
                        <>
                          {(() => {
                            const currentDate = new Date();
                            const currentMonth = currentDate.getMonth();
                            const currentYear = currentDate.getFullYear();
                            
                            const start = new Date(startDate);
                            const end = new Date(endDate);
                            const startMonth = start.getMonth();
                            const startYear = start.getFullYear();
                            const endMonth = end.getMonth();
                            const endYear = end.getFullYear();
                            
                            const isCurrentMonth = (startMonth === currentMonth && startYear === currentYear) && 
                                                   (endMonth === currentMonth && endYear === currentYear);
                            
                            if (isCurrentMonth) {
                              return (
                                <div 
                                  style={{ 
                                    color: palette.orange, 
                                    fontSize: "0.9rem", 
                                    marginTop: 8,
                                    fontWeight: 600,
                                    padding: "8px 12px",
                                    background: `${palette.orange}11`,
                                    borderRadius: 8,
                                    border: `1px solid ${palette.orange}33`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                  }}
                                >
                                  <FaInfoCircle />
                                  ℹ️ Note: All {calculateLeaveDays()} days will be tracked as extra leaves for this month.
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  style={{ 
                                    color: palette.red, 
                                    fontSize: "0.9rem", 
                                    marginTop: 8,
                                    fontWeight: 600,
                                    padding: "8px 12px",
                                    background: `${palette.red}11`,
                                    borderRadius: 8,
                                    border: `1px solid ${palette.red}33`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                  }}
                                >
                                  <FaInfoCircle />
                                  ⚠️ Error: You have no remaining leaves. Extra leaves can only be taken within the current month.
                                </div>
                              );
                            }
                          })()}
                        </>
                      )}
                    </>
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

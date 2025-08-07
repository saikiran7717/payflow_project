import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/DynamicNavigation.jsx";
import EmployeeSidebar from "../components/EmployeeSidebar.jsx";
import { FaCalendarAlt, FaHome, FaUser, FaSignOutAlt, FaFileAlt, FaInfoCircle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
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

export default function LeavesInfo() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED

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

  // Fetch leave data
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!employee?.employeeId && !employee?.id) return;

      try {
        const employeeId = employee.employeeId || employee.id;
        const response = await fetch(`/api/leaves/${employeeId}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Leaves data fetched:", data);
          setLeaves(data);
        } else if (response.status === 403) {
          toast.error("Access denied. Please login again.", { position: "top-center" });
          setTimeout(() => {
            localStorage.removeItem("payflow_user");
            window.location.href = "/login";
          }, 2000);
        } else {
          console.error("Failed to fetch leaves, status:", response.status);
          toast.error("Failed to fetch leave data", { position: "top-center" });
        }
      } catch (error) {
        console.error("Error fetching leaves:", error);
        toast.error("Error loading leave information", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    if (employee) {
      fetchLeaves();
    }
  }, [employee]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <FaCheckCircle style={{ color: palette.green }} />;
      case "rejected":
        return <FaTimesCircle style={{ color: palette.red }} />;
      case "pending":
      default:
        return <FaClock style={{ color: "#d97706" }} />; // Darker orange for better visibility
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return palette.green;
      case "rejected":
        return palette.red;
      case "pending":
      default:
        return "#d97706"; // Darker orange for better visibility
    }
  };

  const filteredLeaves = leaves
    .filter(leave => {
      if (filter === "ALL") return true;
      return leave.status?.toUpperCase() === filter;
    })
    .sort((a, b) => {
      // Sort by applied date (createdAt) in descending order (most recent first)
      const dateA = new Date(a.createdAt || a.appliedDate || 0);
      const dateB = new Date(b.createdAt || b.appliedDate || 0);
      return dateB - dateA;
    });

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLeaveStats = () => {
    const stats = {
      total: leaves.length,
      pending: leaves.filter(l => l.status?.toLowerCase() === "pending").length,
      approved: leaves.filter(l => l.status?.toLowerCase() === "approved").length,
      rejected: leaves.filter(l => l.status?.toLowerCase() === "rejected").length,
    };
    return stats;
  };

  const stats = getLeaveStats();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
      }}>
        <div style={{ color: palette.accent, fontSize: "1.2rem", fontWeight: 600 }}>
          Loading leave information...
        </div>
      </div>
    );
  }

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
        <EmployeeSidebar activePage="leaves-info" />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
              marginBottom: 32,
            }}
          >
            {[
              { label: "Total Requests", value: stats.total, color: palette.blue, icon: <FaFileAlt /> },
              { label: "Pending", value: stats.pending, color: palette.orange, icon: <FaClock /> },
              { label: "Approved", value: stats.approved, color: palette.green, icon: <FaCheckCircle /> },
              { label: "Rejected", value: stats.rejected, color: palette.red, icon: <FaTimesCircle /> },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: palette.white,
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  border: `2px solid ${stat.color}22`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", color: stat.color, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ color: palette.dark, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter Buttons */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: filter === filterOption ? `2px solid ${palette.accent}` : `2px solid ${palette.bg}`,
                    background: filter === filterOption ? palette.accent : palette.white,
                    color: filter === filterOption ? palette.white : palette.dark,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          {/* Leave Requests Table */}
          <div
            style={{
              background: palette.white,
              borderRadius: 20,
              boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
              padding: 32,
              border: `1.5px solid ${palette.accent}22`,
            }}
          >
            <h3
              style={{
                fontWeight: 800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: palette.accent,
                fontSize: "1.3rem",
              }}
            >
              <FaCalendarAlt /> Leave History ({filteredLeaves.length} records)
            </h3>

            {filteredLeaves.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: palette.dark,
                  fontSize: "1.1rem",
                }}
              >
                <FaInfoCircle style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.5 }} />
                <div style={{ fontWeight: 600 }}>No leave requests found</div>
                <div style={{ fontSize: "0.9rem", marginTop: 8, color: palette.gray }}>
                  {filter !== "ALL" ? `No ${filter.toLowerCase()} leaves found.` : "You haven't applied for any leaves yet."}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: palette.darkest, fontWeight: 700, background: palette.bg, borderRadius: "8px 0 0 0" }}>
                        Start Date
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: palette.darkest, fontWeight: 700, background: palette.bg }}>
                        End Date
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "center", color: palette.darkest, fontWeight: 700, background: palette.bg }}>
                        Duration
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: palette.darkest, fontWeight: 700, background: palette.bg }}>
                        Reason
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "center", color: palette.darkest, fontWeight: 700, background: palette.bg }}>
                        Status
                      </th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: palette.darkest, fontWeight: 700, background: palette.bg, borderRadius: "0 8px 0 0" }}>
                        Applied On
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map((leave, index) => (
                      <tr
                        key={leave.id || index}
                        style={{
                          background: "rgba(248,250,252,0.5)",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(248,250,252,0.8)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(248,250,252,0.5)")}
                      >
                        <td style={{ padding: "16px", borderRadius: "8px 0 0 8px", fontWeight: 600, color: palette.darkest }}>
                          {formatDate(leave.startDate)}
                        </td>
                        <td style={{ padding: "16px", fontWeight: 600, color: palette.darkest }}>
                          {formatDate(leave.endDate)}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center", fontWeight: 600, color: palette.darkest }}>
                          {calculateLeaveDays(leave.startDate, leave.endDate)} day(s)
                        </td>
                        <td style={{ padding: "16px", fontWeight: 500, color: palette.dark, maxWidth: "200px", wordWrap: "break-word" }}>
                          {leave.reason || "No reason provided"}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 12px",
                              borderRadius: 20,
                              background: `${getStatusColor(leave.status)}22`,
                              color: getStatusColor(leave.status),
                              fontWeight: 600,
                              fontSize: "0.9rem",
                            }}
                          >
                            {getStatusIcon(leave.status)}
                            {leave.status?.toUpperCase() || "PENDING"}
                          </div>
                        </td>
                        <td style={{ padding: "16px", borderRadius: "0 8px 8px 0", color: palette.dark, fontWeight: 500 }}>
                          {leave.createdAt ? formatDate(leave.createdAt) : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

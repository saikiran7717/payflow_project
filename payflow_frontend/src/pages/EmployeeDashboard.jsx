import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../authContext.jsx";
import DynamicNavigation from "../components/DynamicNavigation.jsx";
import { FaCalendarAlt, FaHome, FaUser, FaSignOutAlt, FaFileAlt, FaInfoCircle, FaLeaf, FaCheckCircle } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const palette = {
  blue: "#2563eb",
  teal: "#06b6d4",
  yellow: "#facc15",
  orange: "#fb923c",
  red: "#ef4444",
  green: "#22c55e",
  purple: "#a21caf",
  gray: "#64748b",
  dark: "#1e293b",
  light: "#f8fafc",
  accent: "#6366f1",
  bg: "#f1f5f9",
  white: "#fff",
};

// Employee Sidebar Component - Styled like HR Dashboard Sidebar
const EmployeeSidebar = React.memo(({ activePage = "dashboard" }) => {
  const handleLogout = useCallback(async () => {
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
  }, []);

  const sidebarPalette = {
    accent: "#6366f1",
    teal: "#06b6d4",
    blue: "#2563eb",
    orange: "#fb923c",
    red: "#ef4444",
    white: "#fff",
    dark: "#1a2233",
    gray: "#64748b",
    bg: "#f8fafc",
  };

  const linkStyle = useCallback((path) => ({
    display: "block",
    padding: "13px 36px",
    fontWeight: 700,
    textDecoration: "none",
    background: activePage === path ? sidebarPalette.accent + "22" : "transparent",
    color: activePage === path ? sidebarPalette.accent : sidebarPalette.dark,
    borderLeft: activePage === path ? `4px solid ${sidebarPalette.accent}` : "4px solid transparent",
    borderRadius: activePage === path ? "0 18px 18px 0" : "0 18px 18px 0",
    margin: "2px 0",
    fontSize: "1.08rem",
    letterSpacing: 0.2,
    transition: "background 0.18s, color 0.18s",
  }), [activePage, sidebarPalette.accent, sidebarPalette.dark]);

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
            color: sidebarPalette.accent,
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
              <a href="/ctc-details" style={linkStyle("ctc-details")}>
                CTC Details
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                style={{
                  background: `linear-gradient(90deg, ${sidebarPalette.red} 60%, #f87171 100%)`,
                  color: sidebarPalette.white,
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
});

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  // Debug: Log authentication info
  useEffect(() => {
    console.log("=== Employee Dashboard Debug Info ===");
    console.log("User from useAuth:", user);
    const storedUser = localStorage.getItem("payflow_user");
    console.log("Stored user data:", storedUser);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("Parsed user data:", parsed);
        console.log("Employee ID:", parsed.employeeId || parsed.id);
        console.log("User role:", parsed.role);
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }
    }
    console.log("=====================================");
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch employee profile data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Get employee basic data from localStorage (from login)
        const userData = localStorage.getItem("payflow_user");
        let employeeInfo = null;
        let employeeId = null;

        if (userData) {
          const user = JSON.parse(userData);
          console.log("Using employee data from localStorage:", user);
          employeeInfo = user;
          employeeId = user.employeeId || user.id;
        }

        // If no localStorage data, try to fetch from API
        if (!employeeInfo) {
          console.log("No localStorage data, fetching employee info from API...");
          
          const headers = {
            "Content-Type": "application/json",
          };

          const res = await fetch("/api/employees/me", {
            method: "GET",
            credentials: "include",
            headers: headers,
          });
          
          if (res.ok) {
            const data = await res.json();
            console.log("Employee data fetched from API:", data);
            employeeInfo = data;
            employeeId = data.employeeId || data.id;
            localStorage.setItem("payflow_user", JSON.stringify(data));
          } else {
            console.error("Failed to fetch employee info, status:", res.status);
            if (res.status === 403) {
              setError("Access denied. Please login again.");
              setTimeout(() => {
                localStorage.removeItem("payflow_user");
                window.location.href = "/login";
              }, 2000);
              return;
            } else {
              throw new Error("Failed to fetch employee information");
            }
          }
        }

        // Fetch complete employee profile to get accurate totalLeaves and other data
        if (employeeId) {
          console.log("Fetching complete employee profile for ID:", employeeId);
          
          try {
            const profileRes = await fetch(`/api/employees/${employeeId}`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (profileRes.ok) {
              const completeProfile = await profileRes.json();
              console.log("Complete employee profile from backend:", completeProfile);
              employeeInfo = { ...employeeInfo, ...completeProfile }; // Merge complete profile data
            } else {
              console.warn("Failed to fetch complete profile, using basic employee info");
            }
          } catch (profileError) {
            console.error("Error fetching complete profile:", profileError);
            // Continue with basic employee info
          }

          // Fetch leave data from backend
          console.log("Fetching leave data for employee ID:", employeeId);
          
          const leaveRes = await fetch(`/api/leaves/${employeeId}`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          let leaveData = [];
          if (leaveRes.ok) {
            leaveData = await leaveRes.json();
            console.log("Leave data fetched from API:", leaveData);
            setLeaves(leaveData);
          } else {
            console.error("Failed to fetch leave data, status:", leaveRes.status);
            // Don't throw error for leave data, just log it
            setLeaves([]);
          }

          // Calculate leave statistics from backend data
          const totalLeaves = employeeInfo.totalLeaves || employeeInfo.allocatedLeaves || 12; // Use backend value with fallback
          console.log("Total leaves from backend:", totalLeaves);

          const usedLeaves = leaveData
            .filter(leave => leave.status?.toLowerCase() === 'approved')
            .reduce((total, leave) => {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const diffTime = Math.abs(end - start);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              console.log(`Leave from ${leave.startDate} to ${leave.endDate}: ${diffDays} days`);
              return total + diffDays;
            }, 0);
          
          console.log("Calculated used leaves:", usedLeaves);
          
          const remainingLeaves = totalLeaves - usedLeaves;
          console.log("Calculated remaining leaves:", remainingLeaves);

          const pendingLeaves = leaveData.filter(leave => leave.status?.toLowerCase() === 'pending').length;
          console.log("Pending leaves count:", pendingLeaves);

          // Enhance employee data with calculated leave info
          const enhancedEmployee = {
            ...employeeInfo,
            totalLeaves: totalLeaves,
            usedLeaves: usedLeaves,
            remLeaves: remainingLeaves,
            pendingLeaves: pendingLeaves,
            extraLeavesThisMonth: employeeInfo.extraLeavesThisMonth || 0, // Include extra leaves data from backend
          };

          console.log("Final enhanced employee data:", enhancedEmployee);
          setEmployee(enhancedEmployee);
        } else {
          throw new Error("No employee ID found");
        }

      } catch (err) {
        console.error("Error fetching employee data:", err);
        setError("Error loading employee data: " + err.message);
        
        // Only use fallback data if specifically requested for development
        if (process.env.NODE_ENV === 'development') {
          console.log("Development mode: Using fallback data");
          const fallbackEmployee = {
            employeeId: 1,
            fullName: "John Doe (Demo)",
            email: "john.doe@company.com",
            position: "Software Developer",
            totalLeaves: 25,
            usedLeaves: 7,
            remLeaves: 18,
            pendingLeaves: 2,
            extraLeavesThisMonth: 0,
          };
          setEmployee(fallbackEmployee);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const today = new Date();
  const formattedDate = useMemo(() => today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }), [today]);

  // Memoized cards data
  const cardsData = useMemo(() => [
    {
      icon: <FaCalendarAlt />,
      label: "Total Leaves",
      value: employee?.totalLeaves ?? "Loading...",
      color: palette.accent,
    },
    {
      icon: <FaLeaf />,
      label: "Remaining Leaves",
      value: employee?.remLeaves ?? "Loading...",
      color: palette.green,
    },
    {
      icon: <FaCheckCircle />,
      label: "Used Leaves",
      value: employee?.usedLeaves ?? "Loading...",
      color: palette.orange,
    },
    {
      icon: <FaInfoCircle />,
      label: "Extra Leaves This Month",
      value: employee?.extraLeavesThisMonth ?? "0",
      color: palette.red,
    },
    {
      icon: <FaCalendarAlt />,
      label: "Today's Date",
      value: formattedDate,
      color: palette.gray,
    },
  ], [employee?.totalLeaves, employee?.remLeaves, employee?.usedLeaves, employee?.extraLeavesThisMonth, formattedDate]);

  // Chart data using real employee leave information from backend
  const leaveStatusData = useMemo(() => ({
    labels: ["Available", "Used", "Pending"],
    datasets: [
      {
        data: [
          employee?.remLeaves || 0, // Available leaves (calculated from backend)
          employee?.usedLeaves || 0, // Used leaves (calculated from approved leaves)
          employee?.pendingLeaves || 0 // Pending leaves (from backend)
        ],
        backgroundColor: ["rgba(34,197,94,0.6)", "rgba(239,68,68,0.6)", "rgba(251,146,60,0.6)"],
        borderColor: ["#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  }), [employee?.remLeaves, employee?.usedLeaves, employee?.pendingLeaves]);

  // Calculate monthly leave usage from actual leave data
  const getMonthlyLeaveData = useCallback(() => {
    const monthlyData = new Array(12).fill(0); // 12 months
    const currentYear = new Date().getFullYear();
    
    if (leaves && leaves.length > 0) {
      leaves
        .filter(leave => leave.status?.toLowerCase() === 'approved')
        .forEach(leave => {
          const startDate = new Date(leave.startDate);
          if (startDate.getFullYear() === currentYear) {
            const month = startDate.getMonth();
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            monthlyData[month] += diffDays;
          }
        });
    }
    
    return monthlyData;
  }, [leaves]);

  const monthlyLeaveData = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Leaves Taken",
        data: getMonthlyLeaveData(),
        backgroundColor: "rgba(99,102,241,0.6)",
        borderColor: "rgba(99,102,241,1)",
        borderWidth: 2,
      },
    ],
  }), [getMonthlyLeaveData]);

  // Pagination logic for leave history
  const totalPages = useMemo(() => Math.ceil(leaves.length / recordsPerPage), [leaves.length, recordsPerPage]);
  const indexOfLastRecord = useMemo(() => currentPage * recordsPerPage, [currentPage, recordsPerPage]);
  const indexOfFirstRecord = useMemo(() => indexOfLastRecord - recordsPerPage, [indexOfLastRecord, recordsPerPage]);
  const currentLeaves = useMemo(() => leaves.slice(indexOfFirstRecord, indexOfLastRecord), [leaves, indexOfFirstRecord, indexOfLastRecord]);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return palette.green;
      case 'rejected': return palette.red;
      case 'pending': return '#f97316'; // Bright orange for better visibility
      default: return palette.gray;
    }
  }, []);

  const getStatusTextColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#1a1a1a'; // Dark text for pending status
      default: return palette.white;
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

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
          Loading...
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
        <EmployeeSidebar activePage="dashboard" />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          {error && (
            <div style={{ 
              background: "#fee2e2", 
              color: "#dc2626", 
              padding: "1rem", 
              borderRadius: 8, 
              marginBottom: "1rem",
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 28,
              marginBottom: 18,
            }}
          >
            {cardsData.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)",
                  borderRadius: 18,
                  boxShadow: "0 6px 24px 0 rgba(36,37,38,0.07)",
                  padding: 28,
                  border: `1.5px solid ${item.color}33`,
                  minHeight: 120,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ fontSize: "2.1rem", color: "#1e293b", filter: "drop-shadow(0 2px 6px #0002)" }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: "#22223b", fontSize: "1.1rem", letterSpacing: 0.2 }}>{item.label}</div>
                <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#1e293b" }}>
                  {typeof item.value === 'number' ? item.value : item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 }}>
            {/* Pie Chart */}
            <div
              style={{
                background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
                borderRadius: 20,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
                border: `1.5px solid ${palette.green}22`,
              }}
            >
              <h4 style={{ marginBottom: 10, color: palette.green, fontWeight: 700, fontSize: "1.1rem", letterSpacing: 0.2 }}>Leave Status</h4>
              <div style={{ width: 260, height: 260 }}>
                <Pie 
                  data={leaveStatusData} 
                  options={{ 
                    plugins: { 
                      legend: { 
                        labels: { 
                          color: "#1a1a1a",
                          font: {
                            weight: 600
                          }
                        } 
                      } 
                    } 
                  }} 
                />
              </div>
            </div>

            {/* Bar Chart */}
            <div style={{ 
              background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
              borderRadius: 20, 
              padding: 28,
              boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
              border: `1.5px solid ${palette.accent}22`,
            }}>
              <h4 style={{ marginBottom: 14, color: palette.accent, fontWeight: 700, fontSize: "1.1rem", letterSpacing: 0.2 }}>
                Monthly Leave Usage
              </h4>
              <Bar
                data={monthlyLeaveData}
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { 
                      display: false 
                    } 
                  },
                  scales: {
                    x: { 
                      ticks: { 
                        color: "#1a1a1a",
                        font: {
                          weight: 600
                        }
                      } 
                    },
                    y: { 
                      ticks: { 
                        color: "#1a1a1a",
                        font: {
                          weight: 600
                        }
                      },
                      beginAtZero: true 
                    }
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

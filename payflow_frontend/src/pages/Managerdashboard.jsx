import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import ManagerNavigation from "../components/ManagerNavigation";
import { useAuth } from "../authContext.jsx";
import { FaUsers, FaCheckCircle, FaUserSlash, FaCalendarAlt } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
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

export default function ManagerDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
  
  // Modal states for employee details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Past experience modal states
  const [showExpModal, setShowExpModal] = useState(false);
  const [expEmp, setExpEmp] = useState(null);
  const [expData, setExpData] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState(null);

  // Pending leave requests states
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
  const [pendingLeavesLoading, setPendingLeavesLoading] = useState(false);

  // Determine current view based on URL - check for /employees path specifically
  const currentView = location.pathname === "/employees" ? "employeeList" : "dashboard";

  const fetchEmployees = () => {
    setLoading(true);
    fetch("/api/employees/getAll")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load employees");
        return res.json();
      })
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load employees.");
        setLoading(false);
      });
  };

  // Fetch pending leave requests for manager's employees
  const fetchPendingLeaveRequests = async () => {
    setPendingLeavesLoading(true);
    try {
      const response = await fetch("/api/leaves/all", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pendingLeaves = Array.isArray(data) 
          ? data.filter(leave => leave.status?.toUpperCase() === 'PENDING')
            .slice(0, 3) // Show only first 3 pending requests
          : [];
        
        setPendingLeaveRequests(pendingLeaves);
      } else {
        // Fallback to mock data
        const mockPendingLeaves = [
          {
            id: 1,
            employeeId: "EMP001",
            employeeName: "John Doe",
            startDate: "2025-08-10",
            endDate: "2025-08-12",
            reason: "Personal work",
            status: "PENDING",
            appliedDate: "2025-08-05"
          },
          {
            id: 2,
            employeeId: "EMP002", 
            employeeName: "Jane Smith",
            startDate: "2025-08-15",
            endDate: "2025-08-17",
            reason: "Medical appointment",
            status: "PENDING",
            appliedDate: "2025-08-07"
          },
          {
            id: 3,
            employeeId: "EMP003", 
            employeeName: "Mike Johnson",
            startDate: "2025-08-20",
            endDate: "2025-08-22",
            reason: "Family vacation",
            status: "PENDING",
            appliedDate: "2025-08-08"
          }
        ];
        setPendingLeaveRequests(mockPendingLeaves);
      }
    } catch (error) {
      console.error("Error fetching pending leave requests:", error);
      
      // Fallback to mock data on error
      const mockPendingLeaves = [
        {
          id: 1,
          employeeId: "EMP001",
          employeeName: "John Doe", 
          startDate: "2025-08-10",
          endDate: "2025-08-12",
          reason: "Personal work",
          status: "PENDING",
          appliedDate: "2025-08-05"
        },
        {
          id: 2,
          employeeId: "EMP002",
          employeeName: "Sarah Wilson", 
          startDate: "2025-08-18",
          endDate: "2025-08-20",
          reason: "Medical checkup",
          status: "PENDING",
          appliedDate: "2025-08-06"
        }
      ];
      setPendingLeaveRequests(mockPendingLeaves);
    } finally {
      setPendingLeavesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPendingLeaveRequests();
  }, []);

  // Helper function to calculate leave days
  const calculateLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const activeEmployees = employees.filter((emp) => emp.isActive === true);
  const disabledEmployees = employees.filter((emp) => emp.isActive === false);

  const totalPages = Math.ceil(employees.length / employeesPerPage);
  const currentEmployees = employees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  const handleToggleStatus = async (employeeId, currentStatus) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchEmployees();
      } else {
        console.error("Status update failed");
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  // Handle employee details modal
  const handleShowEmployeeDetails = (emp) => {
    setSelectedEmployee(emp);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  // Handle past experience modal
  const handleShowPastExp = async (emp) => {
    setExpEmp(emp);
    setShowExpModal(true);
    setExpLoading(true);
    setExpError(null);
    
    try {
      const res = await fetch(`/api/employees/${emp.employeeId || emp.id}/experiences`);
      if (res.ok) {
        const data = await res.json();
        setExpData(Array.isArray(data) ? data : []);
      } else {
        setExpError("Failed to load past experiences.");
      }
    } catch (err) {
      setExpError("Error loading past experiences.");
    } finally {
      setExpLoading(false);
    }
  };

  const handleCloseExpModal = () => {
    setShowExpModal(false);
    setExpEmp(null);
    setExpData([]);
    setExpError(null);
  };

  const onboardedMonthCounts = {};
  employees.forEach((emp) => {
    if (emp.onboardedAt) {
      const d = new Date(emp.onboardedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      onboardedMonthCounts[key] = (onboardedMonthCounts[key] || 0) + 1;
    }
  });

  const onboardedSortedMonths = Object.keys(onboardedMonthCounts).sort();
  const onboardedMonthLabels = onboardedSortedMonths.map((m) => {
    const [year, month] = m.split("-");
    return new Date(year, month - 1).toLocaleString(undefined, {
      month: "short",
      year: "numeric",
    });
  });
  const onboardedMonthData = onboardedSortedMonths.map((m) => onboardedMonthCounts[m]);

  const onboardedBarData = {
    labels: onboardedMonthLabels,
    datasets: [
      {
        label: "Employees Onboarded",
        data: onboardedMonthData,
        backgroundColor: "rgba(99,102,241,0.6)",
        borderColor: "rgba(99,102,241,1)",
        borderWidth: 2,
      },
    ],
  };

  const statusPieData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [activeEmployees.length, disabledEmployees.length],
        backgroundColor: ["rgba(34,197,94,0.6)", "rgba(239,68,68,0.6)"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
      }}
    >
      <ManagerNavigation />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          {currentView === "dashboard" && (
            <>
              {/* Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 28,
                  marginBottom: 18,
                }}
              >
                {[
                  {
                    icon: <FaUsers />,
                    label: "Total Employees",
                    value: employees.length,
                    color: palette.blue,
                  },
                  {
                    icon: <FaCheckCircle />,
                    label: "Active Employees",
                    value: activeEmployees.length,
                    color: palette.green,
                  },
                  {
                    icon: <FaUserSlash />,
                    label: "Disabled Employees",
                    value: disabledEmployees.length,
                    color: palette.red,
                  },
                  {
                    icon: <FaCalendarAlt />,
                    label: "Date",
                    value: formattedDate,
                    color: palette.teal,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)",
                      borderRadius: 18,
                      boxShadow: "0 6px 24px 0 rgba(36,37,38,0.07)",
                      padding: 28,
                      border: `1.5px solid ${item.color}33`,
                      minHeight: 120,
                    }}
                  >
                    <div style={{ fontSize: "2.1rem", color: "#1a1a1a" }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "1.1rem" }}>{item.label}</div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Pending Leave Requests Widget */}
              <div
                style={{
                  background: `linear-gradient(120deg, #f8fafc 80%, #e0e7ef 100%)`,
                  borderRadius: 20,
                  boxShadow: "0 6px 24px 0 rgba(249, 115, 22, 0.09)",
                  padding: 28,
                  border: `1.5px solid ${palette.orange}`,
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 800,
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      color: palette.orange,
                      fontSize: "1.4rem",
                      letterSpacing: 0.2,
                    }}
                  >
                    <FaCalendarAlt /> Pending Leave Requests
                  </h3>
                  <button
                    style={{
                      background: palette.accent,
                      color: palette.white,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      transition: "all 0.2s",
                    }}
                    onClick={() => window.location.href = "/leave-requests"}
                    onMouseOver={(e) => {
                      e.target.style.background = "#5b5fc7";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.6)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = palette.accent;
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
                    }}
                  >
                    View All Pending Requests
                  </button>
                </div>

                {pendingLeavesLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: palette.orange, fontWeight: 600, fontSize: "1.1rem" }}>
                      Loading pending requests...
                    </p>
                  </div>
                ) : pendingLeaveRequests.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      background: palette.white,
                      borderRadius: 12,
                      border: `2px dashed ${palette.gray}44`,
                    }}
                  >
                    <FaCheckCircle
                      style={{
                        fontSize: "3rem",
                        color: palette.green,
                        marginBottom: 16,
                      }}
                    />
                    <p style={{ color: palette.green, fontWeight: 600, fontSize: "1.2rem", margin: 0 }}>
                      No pending leave requests!
                    </p>
                    <p style={{ color: palette.gray, fontWeight: 500, fontSize: "1rem", margin: "8px 0 0 0" }}>
                      All leave requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      background: palette.white,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: `2px solid ${palette.orange}55`,
                      boxShadow: "0 2px 8px rgba(251, 146, 60, 0.15)",
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr 100px 150px",
                        background: `${palette.orange}20`,
                        borderBottom: `2px solid ${palette.orange}66`,
                        padding: "16px 20px",
                        gap: 16,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: palette.orange, fontSize: "0.95rem" }}>
                        Employee ID
                      </div>
                      <div style={{ fontWeight: 700, color: palette.orange, fontSize: "0.95rem" }}>
                        Employee Name
                      </div>
                      <div style={{ fontWeight: 700, color: palette.orange, fontSize: "0.95rem" }}>
                        Days
                      </div>
                      <div style={{ fontWeight: 700, color: palette.orange, fontSize: "0.95rem" }}>
                        Applied Date
                      </div>
                    </div>

                    {/* Data Rows */}
                    {pendingLeaveRequests.map((request, idx) => (
                      <div
                        key={request.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 1fr 100px 150px",
                          padding: "16px 20px",
                          gap: 16,
                          borderBottom: idx < pendingLeaveRequests.length - 1 ? `1px solid ${palette.gray}66` : "none",
                          transition: "all 0.2s",
                          cursor: "pointer",
                          background: idx % 2 === 0 ? palette.white : `${palette.orange}08`,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = `${palette.orange}15`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = idx % 2 === 0 ? palette.white : `${palette.orange}08`;
                        }}
                        onClick={() => window.location.href = "/leave-requests"}
                      >
                        <div
                          style={{
                            background: `${palette.orange}33`,
                            color: "#d97706",
                            padding: "6px 8px",
                            borderRadius: 6,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textAlign: "center",
                            width: "fit-content",
                            minWidth: "70px",
                            border: `1px solid ${palette.orange}66`,
                          }}
                        >
                          {request.employeeId || request.employee_id || request.employee?.employeeId || request.employee?.id || `EMP${String(idx + 1).padStart(3, '0')}`}
                        </div>
                        <div style={{ color: "#1a1a1a", fontSize: "0.95rem", fontWeight: 600 }}>
                          {request.employeeName || request.employee?.name || request.employee?.fullName || "Unknown Employee"}
                        </div>
                        <div style={{ color: "#1a1a1a", fontSize: "0.95rem", fontWeight: 600, textAlign: "center" }}>
                          {calculateLeaveDays(request.startDate, request.endDate)}
                        </div>
                        <div style={{ color: "#475569", fontSize: "0.9rem", fontWeight: 600 }}>
                          {request.appliedDate ? new Date(request.appliedDate).toLocaleDateString() : 
                           request.startDate ? new Date(request.startDate).toLocaleDateString() : 
                           new Date().toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                {/* Pie Chart */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <h4 style={{ marginBottom: 10, color: "#1a1a1a", fontWeight: 700, fontSize: "1.1rem" }}>Employee Status</h4>
                  <div style={{ width: 260, height: 260 }}>
                    <Pie 
                      data={statusPieData} 
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
                <div style={{ background: "#fff", borderRadius: 20, padding: 28 }}>
                  <h4 style={{ marginBottom: 14, color: "#1a1a1a", fontWeight: 700, fontSize: "1.1rem" }}>
                    Monthly Employees Onboarded
                  </h4>
                  <Bar
                    data={onboardedBarData}
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
            </>
          )}

          {currentView === "employeeList" && (
            /* Employee List Section */
            <div
              style={{
                background: `linear-gradient(120deg, #f8fafc 80%, #e0e7ef 100%)`,
                borderRadius: 20,
                boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
                padding: 36,
                border: `1.5px solid ${palette.accent}22`,
              }}
            >
              <h3
                style={{
                  fontWeight: 800,
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: palette.accent,
                  fontSize: "1.25rem",
                  letterSpacing: 0.2,
                }}
              >
                <FaUsers /> Employee List
              </h3>
              {loading ? (
                <p style={{ color: palette.accent, fontWeight: 600, fontSize: "1.1rem" }}>Loading employees...</p>
              ) : error ? (
                <p style={{ color: palette.red, fontWeight: 600 }}>{error}</p>
              ) : (
                <>
                  <div style={{ width: "100%" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "1.05rem",
                        color: "#1a1a1a",
                        background: "transparent",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px #6366f111",
                        border: `2px solid ${palette.dark}44`,
                      }}
                    >
                      <thead
                        style={{
                          background: palette.accent + "11",
                          borderBottom: `2.5px solid ${palette.accent}`,
                          textAlign: "left",
                        }}
                      >
                        <tr>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>ID</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Full Name</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Email</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Designation</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Manager</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Status</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEmployees.map((emp, idx) => (
                          <tr
                            key={emp.id || emp.employeeId}
                            style={{
                              borderBottom: "1.5px solid #64748b66",
                              background:
                                idx % 2 === 0
                                  ? palette.white
                                  : palette.bg,
                              transition: "background 0.2s",
                              color: "#1a1a1a",
                            }}
                          >
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{emp.id || emp.employeeId}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{emp.name || emp.fullName}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{emp.email}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{emp.designation || emp.position}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>
                              {emp.manager ? `${emp.manager.username}` : 'No Manager'}
                            </td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22` }}>
                              <button
                                onClick={() => handleToggleStatus(emp.id || emp.employeeId, emp.isActive)}
                                style={{
                                  background: emp.isActive ? "#ef4444" : "#22c55e",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "7px 16px",
                                  cursor: "pointer",
                                  color: palette.white,
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  boxShadow: "0 2px 8px #6366f122",
                                  transition: "background 0.2s",
                                }}
                              >
                                {emp.isActive ? "Disable" : "Enable"}
                              </button>
                            </td>
                            <td style={{ padding: 14 }}>
                              <button
                                style={{
                                  background: palette.accent,
                                  color: palette.white,
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "7px 16px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontSize: "1rem",
                                  boxShadow: "0 2px 8px #6366f122",
                                  transition: "background 0.2s",
                                }}
                                onClick={() => handleShowEmployeeDetails(emp)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                      gap: 14,
                    }}
                  >
                    <button
                      onClick={() => setCurrentPage(prev => prev > 1 ? prev - 1 : 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: `1.5px solid ${palette.accent}`,
                        background: currentPage === 1 ? palette.bg : palette.accent,
                        color: currentPage === 1 ? palette.accent : palette.white,
                        cursor: currentPage === 1 ? "default" : "pointer",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        transition: "background 0.2s",
                      }}
                    >
                      Previous
                    </button>
                    <span style={{ fontWeight: 700, alignSelf: "center", color: palette.accent, fontSize: "1.08rem" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 8,
                        border: `1.5px solid ${palette.accent}`,
                        background: currentPage === totalPages ? palette.bg : palette.accent,
                        color: currentPage === totalPages ? palette.accent : palette.white,
                        cursor: currentPage === totalPages ? "default" : "pointer",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        transition: "background 0.2s",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Employee Details Modal */}
          {showDetailsModal && selectedEmployee && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(30,41,59,0.18)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleCloseDetailsModal}
            >
              <div
                className="custom-scrollbar"
                style={{
                  background: palette.white,
                  borderRadius: 18,
                  boxShadow: "0 8px 32px 0 rgba(36,37,38,0.18)",
                  padding: 36,
                  minWidth: 500,
                  maxWidth: 700,
                  maxHeight: "80vh",
                  overflowY: "auto",
                  position: "relative",
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={handleCloseDetailsModal}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: palette.red,
                    color: palette.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px #6366f122",
                  }}
                >
                  Close
                </button>
                <h3 style={{ fontWeight: 800, color: palette.accent, marginBottom: 24, letterSpacing: 0.5 }}>
                  Employee Details - {selectedEmployee.name || selectedEmployee.fullName}
                </h3>
                
                {/* Professional Information Section */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 700, 
                    color: palette.accent, 
                    marginBottom: 12,
                    borderBottom: `2px solid ${palette.accent}33`,
                    paddingBottom: 6
                  }}>
                    Professional Information
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Designation:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.designation || selectedEmployee.position || selectedEmployee.jobTitle || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Department:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.department || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Total Experience:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.totalExperience || "N/A"} years</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Status:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: selectedEmployee.isActive ? "#4CAF50" : "#FF5722", fontWeight: 700 }}>
                        {selectedEmployee.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 700, 
                    color: palette.accent, 
                    marginBottom: 12,
                    borderBottom: `2px solid ${palette.accent}33`,
                    paddingBottom: 6
                  }}>
                    Personal Information
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>ID:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.id || selectedEmployee.employeeId}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Age:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.age || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Phone:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.phone || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8, gridColumn: "1 / -1" }}>
                      <strong style={{ color: palette.accent }}>Address:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Educational Information Section */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 700, 
                    color: palette.accent, 
                    marginBottom: 12,
                    borderBottom: `2px solid ${palette.accent}33`,
                    paddingBottom: 6
                  }}>
                    Educational Information
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Degree:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.degree || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>University:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.university || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Graduation Year:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.graduationYear || "N/A"}</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Grade:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.grade || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Leave Information Section */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 700, 
                    color: palette.accent, 
                    marginBottom: 12,
                    borderBottom: `2px solid ${palette.accent}33`,
                    paddingBottom: 6
                  }}>
                    Leave Information
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Total Leaves:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.totalLeaves || "N/A"} days</p>
                    </div>
                    <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                      <strong style={{ color: palette.accent }}>Remaining Leaves:</strong>
                      <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.remLeaves || "N/A"} days</p>
                    </div>
                  </div>
                </div>
                
                {/* Past Experience Button */}
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <button
                    style={{
                      background: "#00bfff",
                      color: palette.white,
                      border: `2px solid #00bfff`,
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      boxShadow: "0 4px 12px rgba(0, 191, 255, 0.4)",
                      transition: "all 0.2s",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => handleShowPastExp(selectedEmployee)}
                    onMouseOver={(e) => {
                      e.target.style.background = "#0099cc";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(0, 191, 255, 0.6)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#00bfff";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(0, 191, 255, 0.4)";
                    }}
                  >
                    Past Experience
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Past Experience Modal */}
          {showExpModal && expEmp && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(30,41,59,0.18)",
                zIndex: 1001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleCloseExpModal}
            >
              <div
                className="custom-scrollbar"
                style={{
                  background: palette.white,
                  borderRadius: 18,
                  boxShadow: "0 8px 32px 0 rgba(36,37,38,0.18)",
                  padding: 36,
                  minWidth: 500,
                  maxWidth: 700,
                  maxHeight: "80vh",
                  overflowY: "auto",
                  position: "relative",
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={handleCloseExpModal}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: palette.red,
                    color: palette.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px #6366f122",
                  }}
                >
                  Close
                </button>
                <h3 style={{ fontWeight: 800, color: palette.accent, marginBottom: 18, letterSpacing: 0.5 }}>
                  Past Experiences for {expEmp?.name || expEmp?.fullName || expEmp?.email}
                </h3>
                {expLoading ? (
                  <p style={{ color: palette.accent, fontWeight: 600 }}>Loading...</p>
                ) : expError ? (
                  <p style={{ color: palette.red, fontWeight: 600 }}>{expError}</p>
                ) : expData.length === 0 ? (
                  <p style={{ color: "#1a1a1a", fontWeight: 600 }}>No past experiences found.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                    <thead>
                      <tr style={{ background: palette.bg }}>
                        <th style={{ padding: 10, fontWeight: 700, color: palette.accent }}>Company</th>
                        <th style={{ padding: 10, fontWeight: 700, color: palette.accent }}>Role</th>
                        <th style={{ padding: 10, fontWeight: 700, color: palette.accent }}>Years</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expData.map((exp, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? palette.white : palette.bg, color: '#111' }}>
                          <td style={{ padding: 10 }}>{exp.companyName || exp.company}</td>
                          <td style={{ padding: 10 }}>{exp.role}</td>
                          <td style={{ padding: 10 }}>
                            {exp.years || exp.yearsOfExperience || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

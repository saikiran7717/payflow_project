// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaUserShield, FaHome, FaUsers, FaSignOutAlt, FaUser } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../authContext.jsx";
import "../styles/Layout.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Custom scrollbar styles - reversed colors (gray thumb, white track)
const customScrollbarStyle = `
  /* Custom scrollbar for webkit browsers */
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 10px;
    border: 2px solid #ffffff;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
  
  /* For Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #9ca3af #ffffff;
  }

  /* Global scrollbar styles for the entire page */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: #ffffff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 10px;
    border: 2px solid #ffffff;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  /* Global Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: #9ca3af #ffffff;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined' && !document.getElementById('custom-scrollbar-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-scrollbar-styles';
  style.textContent = customScrollbarStyle;
  document.head.appendChild(style);
}

function InfoCard({ title, value, icon, color }) {
  // Use a more intense/darker color for icon and number
  const intense = "#1e293b"; // very dark blue-gray
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)",
        borderRadius: 18,
        boxShadow: "0 6px 24px 0 rgba(36,37,38,0.07)",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        border: `1.5px solid ${color}33`,
        minHeight: 120,
        transition: "box-shadow 0.2s",
      }}
    >
      <span style={{ fontSize: "2.1rem", color: intense, filter: "drop-shadow(0 2px 6px #0002)" }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "1.15rem", color: "#22223b", letterSpacing: 0.2 }}>{title}</span>
      <span style={{ fontWeight: 700, fontSize: "1.7rem", color: intense }}>{value}</span>
    </div>
  );
}

export default function AdminDashboard({ active }) {
  // Add state for toggling between user and employee list
  const [showEmployees, setShowEmployees] = useState(false);
  // Modal state for past experiences and employee details
  const [showExpModal, setShowExpModal] = useState(false);
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState("");
  const [expData, setExpData] = useState([]);
  const [expEmp, setExpEmp] = useState(null);

  // Modal state for employee details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);


  // Fetch past experiences for an employee (use correct endpoint)
  const handleShowPastExp = async (emp) => {
    setShowExpModal(true);
    setExpLoading(true);
    setExpError("");
    setExpEmp(emp);
    try {
      const res = await fetch(`/api/employees/${emp.employeeId || emp.id}/experiences`);
      if (!res.ok) throw new Error("Failed to fetch past experiences");
      const data = await res.json();
      setExpData(Array.isArray(data) ? data : []);
    } catch (err) {
      setExpError(err.message || "Failed to fetch past experiences");
      setExpData([]);
    } finally {
      setExpLoading(false);
    }
  };

  const handleCloseExpModal = () => {
    setShowExpModal(false);
    setExpData([]);
    setExpEmp(null);
    setExpError("");
  };

  // Handle employee details modal
  const handleShowEmployeeDetails = useCallback(async (emp) => {
    setSelectedEmployee(emp);
    setShowDetailsModal(true);
    
    // Fetch updated employee information and leave data
    try {
      const employeeId = emp.employeeId || emp.id;
      
      // First, fetch the complete employee profile to get accurate totalLeaves
      const employeeResponse = await fetch(`/api/employees/${employeeId}`, {
        method: "GET",
        credentials: "include",
      });
      
      let completeEmployeeData = emp; // Fallback to original data
      if (employeeResponse.ok) {
        completeEmployeeData = await employeeResponse.json();
      }
      
      // Then fetch employee's leave data to calculate correct remaining leaves
      const leavesResponse = await fetch(`/api/leaves/${employeeId}`, {
        method: "GET",
        credentials: "include",
      });
      
      let leaveData = [];
      if (leavesResponse.ok) {
        leaveData = await leavesResponse.json();
      }
      
      // Calculate leave statistics exactly like Employee Dashboard does
      const totalLeaves = completeEmployeeData.totalLeaves || 12; // Use complete employee data
      
      const usedLeaves = leaveData
        .filter(leave => leave.status?.toLowerCase() === 'approved')
        .reduce((total, leave) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return total + diffDays;
        }, 0);
      
      const remainingLeaves = totalLeaves - usedLeaves;
      const pendingLeaves = leaveData.filter(leave => leave.status?.toLowerCase() === 'pending').length;
      
      // Update the selected employee with complete data and correct leave calculations
      setSelectedEmployee(prev => ({
        ...completeEmployeeData, // Use complete employee data instead of list data
        totalLeaves: totalLeaves,
        usedLeaves: usedLeaves,
        remLeaves: remainingLeaves,
        pendingLeaves: pendingLeaves,
        leaveData: leaveData // Store the leave data for reference
      }));
      
    } catch (error) {
      console.error("Error fetching employee data:", error);
      // Keep original employee data if there's an error
    }
  }, []);

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const routePanel =
    active ||
    (location.pathname.includes("add-user")
      ? "createForm"
      : location.pathname.includes("users")
      ? "userList"
      : location.pathname.includes("employees")
      ? "employeeList"
      : "dashboard");

  // Users state and logic (same as before)
  const [form, setForm] = useState({ username: "", email: "", role: "hr" });
  // Removed unused 'created' state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/users/getAllUsers");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];
      const mappedUsers = usersArray.map((u) => ({
        ...u,
        status: u.status === true ? "active" : "inactive",
      }));
      setUsers(mappedUsers);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          role: form.role.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("duplicate")) {
          throw new Error(
            "Email or username already exists. Please use a different one."
          );
        }
        throw new Error("Registration failed");
      }

      const newUser = await res.json();
      // setCreated(newUser); // removed unused state
      setForm({ username: "", email: "", role: "hr" });
      fetchUsers();
      toast.success(`${newUser.role} added successfully!`);
      
      // Redirect to users list after short delay to show toast
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Registration failed");
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setError("");
    setLoading(true);
    try {
      const user = users.find((u) => u.id === id || u.userId === id);
      if (!user) throw new Error("User not found");
      const newStatusBool = user.status === "active" ? false : true;
      const res = await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatusBool }),
      });
      if (!res.ok) throw new Error("Failed to update user status");
      toast.success(`User status updated successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user");
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };



  // Employee list state and logic (same as user list)
  const [employees, setEmployees] = useState([]);

  // Users stats and chart data
  const safeUsers = Array.isArray(users) ? users : [];
  // Count employees for chart
  const totalHRs = safeUsers.filter((u) => u.role && u.role.toLowerCase() === "hr").length;
  const totalManagers = safeUsers.filter((u) => u.role && u.role.toLowerCase() === "manager").length;
  // Employees are those in the employees array
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  // Total users includes employees
  const totalUsers = safeUsers.length + totalEmployees;
  const totalActive = safeUsers.filter((u) => u.status === "active" || u.status === true).length;
  const totalInactive = safeUsers.filter((u) => u.status === "inactive" || u.status === false).length;

  // Color palette for charts with brighter status colors
  const palette = {
    blue: "#93c5fd",      // subtle blue
    teal: "#99f6e4",      // subtle teal
    yellow: "#fde68a",    // subtle yellow
    orange: "#fdba74",    // subtle orange
    red: "#ef4444",       // bright red for inactive status
    green: "#22c55e",     // bright green for active status
    purple: "#ddd6fe",    // subtle purple
    gray: "#e5e7eb",      // subtle gray
    dark: "#64748b",
    light: "#f8fafc",
    accent: "#6366f1",
    bg: "#f1f5f9",
    white: "#fff",
  };

  // Pie/Bar chart: HR, Manager, Employees
  const rolePieData = {
    labels: ["HR", "Manager", "Employees"],
    datasets: [
      {
        data: [totalHRs, totalManagers, totalEmployees],
        backgroundColor: [palette.blue, palette.orange, palette.purple],
        borderColor: [palette.dark, palette.dark, palette.dark],
        borderWidth: 2,
      },
    ],
  };
  const statusDoughnutData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [totalActive, totalInactive],
        backgroundColor: [palette.green, palette.red],
        borderColor: [palette.dark, palette.dark],
        borderWidth: 2,
      },
    ],
  };
  const barData = {
    labels: ["HR", "Manager", "Employees"],
    datasets: [
      {
        label: "Users by Role",
        data: [totalHRs, totalManagers, totalEmployees],
        backgroundColor: [palette.blue, palette.orange, palette.purple],
        borderColor: [palette.dark, palette.dark, palette.dark],
        borderWidth: 2,
      },
    ],
  };

  // Monthly users created line chart data
  // Group users by month (createdAt)
  const userMonthCounts = {};
  safeUsers.forEach(u => {
    if (u.createdAt) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      userMonthCounts[key] = (userMonthCounts[key] || 0) + 1;
    }
  });
  // Sort months chronologically
  const sortedMonths = Object.keys(userMonthCounts).sort();
  // Format for display (e.g. Jul 2025)
  const monthLabels = sortedMonths.map(m => {
    const [year, month] = m.split("-");
    return new Date(year, month - 1).toLocaleString(undefined, { month: "short", year: "numeric" });
  });
  const monthData = sortedMonths.map(m => userMonthCounts[m]);

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Users Created",
        data: monthData,
        fill: false,
        borderColor: palette.accent,
        backgroundColor: palette.accent + "33",
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: palette.accent,
        pointBorderColor: palette.accent,
      },
    ],
  };

  // User pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = safeUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(safeUsers.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const employeesPerPage = 10;

 useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/employees/getAll");
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setError(err.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const empIndexOfLast = empCurrentPage * employeesPerPage;
  const empIndexOfFirst = empIndexOfLast - employeesPerPage;
  const currentEmployees = employees.slice(empIndexOfFirst, empIndexOfLast);
  const empTotalPages = Math.ceil(employees.length / employeesPerPage);

  const handleEmpNextPage = () => {
    if (empCurrentPage < empTotalPages) {
      setEmpCurrentPage((prev) => prev + 1);
    }
  };

  const handleEmpPreviousPage = () => {
    if (empCurrentPage > 1) {
      setEmpCurrentPage((prev) => prev - 1);
    }
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
            <FaHome /> Admin Dashboard
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontWeight: 700, color: palette.dark, fontSize: "1.1rem", letterSpacing: 0.2 }}>
            {user?.username ? `Welcome, ${user.username}` : "Welcome, Admin"}
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
              background: `linear-gradient(90deg, #f1f5f9 60%, #e0e7ef 100%)`,
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
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 72px)" }}>
        <Sidebar />
        <main style={{ marginLeft: 0, padding: "2.5rem 2rem 2rem 2rem", width: "100%" }}>
          {routePanel === "dashboard" && (
            <div>
              {/* InfoCards: 2 rows, 6 in first row, 1 in second row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 28, marginBottom: 18 }}>
                <InfoCard title="Total Users" value={totalUsers} icon={<FaUsers />} color={palette.accent} />
                <InfoCard title="Total HRs" value={totalHRs} icon={<FaUserShield />} color={palette.blue} />
                <InfoCard title="Total Managers" value={totalManagers} icon={<FaUserPlus />} color={palette.orange} />
                <InfoCard title="Total Employees" value={totalEmployees} icon={<FaUserPlus />} color={palette.purple} />
                <InfoCard title="Active Users" value={totalActive} icon={<FaUsers />} color={palette.green} />
                <InfoCard title="Disabled Users" value={totalInactive} icon={<FaSignOutAlt />} color={palette.red} />
              </div>
              {/* Charts: 1st row: Date, Users by Role, Monthly Users; 2nd row: Pie and Doughnut charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginBottom: 18 }}>
                <InfoCard
                  title="Current Date"
                  value={new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  icon={<FaHome />}
                  color={palette.gray}
                />
                <div
                  style={{
                    background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
                    borderRadius: 20,
                    boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
                    padding: 28,
                    minWidth: 220,
                    border: `1.5px solid ${palette.orange}22`,
                  }}
                >
                  <h4 style={{ marginBottom: 14, color: palette.orange, fontWeight: 700, fontSize: "1.1rem", letterSpacing: 0.2 }}>Users by Role</h4>
                  <Bar data={barData} options={{ plugins: { legend: { display: false, labels: { color: "#1a1a1a" } } }, scales: { x: { ticks: { color: "#1a1a1a" } }, y: { ticks: { color: "#1a1a1a" } } } }} />
                </div>
                <div
                  style={{
                    background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
                    borderRadius: 20,
                    boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
                    padding: 28,
                    minWidth: 220,
                    border: `1.5px solid ${palette.accent}22`,
                  }}
                >
                  <h4 style={{ marginBottom: 14, color: palette.accent, fontWeight: 700, fontSize: "1.1rem", letterSpacing: 0.2 }}>Monthly Users Created</h4>
                  <Bar data={lineData} options={{
                    plugins: { legend: { display: false }, },
                    scales: {
                      x: { ticks: { color: "#1a1a1a" } },
                      y: { ticks: { color: "#1a1a1a" }, beginAtZero: true },
                    },
                    elements: { line: { borderWidth: 3 } },
                  }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 36 }}>
                <div
                  style={{
                    background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
                    borderRadius: 20,
                    boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
                    padding: 28,
                    border: `1.5px solid ${palette.blue}22`,
                  }}
                >
                  <h4 style={{ marginBottom: 10, color: palette.blue, fontWeight: 700, fontSize: "1.05rem", letterSpacing: 0.2 }}>User Roles Distribution</h4>
                  <Pie data={rolePieData} options={{ plugins: { legend: { labels: { color: "#1a1a1a" } } } }} />
                </div>
                <div
                  style={{
                    background: `linear-gradient(120deg, ${palette.white} 80%, #e0e7ef 100%)`,
                    borderRadius: 20,
                    boxShadow: "0 6px 24px rgba(36,37,38,0.07)",
                    padding: 28,
                    border: `1.5px solid ${palette.green}22`,
                  }}
                >
                  <h4 style={{ marginBottom: 10, color: palette.green, fontWeight: 700, fontSize: "1.05rem", letterSpacing: 0.2 }}>User Status</h4>
                  <Doughnut data={statusDoughnutData} options={{ plugins: { legend: { labels: { color: "#1a1a1a" } } } }} />
                </div>
              </div>

            </div>
          )}

          {routePanel === "createForm" && (
            <div
              style={{
                background: `linear-gradient(120deg, #f8fafc 80%, #e0e7ef 100%)`,
                borderRadius: 20,
                boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
                padding: 40,
                maxWidth: 480,
                margin: "40px auto",
                border: `1.5px solid ${palette.accent}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                  fontSize: "1.35rem",
                  letterSpacing: 0.2,
                }}
              >
                <FaUserPlus /> Add HR / Manager
              </h3>
              <form
                onSubmit={handleSubmit}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}
              >
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="Full Name"
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${palette.accent}33`,
                    background: palette.white,
                    color: "#333333",
                    fontSize: "1.08rem",
                    fontWeight: 500,
                    outline: "none",
                    boxShadow: "0 2px 8px #6366f111",
                    transition: "border 0.2s",
                  }}
                />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                  placeholder="Email"
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${palette.accent}33`,
                    background: palette.white,
                    color: "#333333",
                    fontSize: "1.08rem",
                    fontWeight: 500,
                    outline: "none",
                    boxShadow: "0 2px 8px #6366f111",
                    transition: "border 0.2s",
                  }}
                />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${palette.accent}33`,
                    background: palette.white,
                    color: "#333333",
                    fontSize: "1.08rem",
                    fontWeight: 500,
                    outline: "none",
                    boxShadow: "0 2px 8px #6366f111",
                    transition: "border 0.2s",
                  }}
                >
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                </select>
                <button
                  style={{
                    background: loading ? palette.teal + "55" : palette.accent,
                    color: palette.white,
                    border: "none",
                    borderRadius: 10,
                    padding: "13px 0",
                    fontWeight: 800,
                    fontSize: "1.13rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: 8,
                    boxShadow: "0 2px 8px #6366f122",
                    letterSpacing: 0.2,
                    transition: "background 0.2s",
                  }}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Add Account"}
                </button>
              </form>
            </div>
          )}

          {routePanel === "userList" && (
            <div
              style={{
                marginTop: 40,
                background: `linear-gradient(120deg, #f8fafc 80%, #e0e7ef 100%)`,
                borderRadius: 20,
                boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
                padding: 36,
                maxWidth: 950,
                margin: "40px auto",
                border: `1.5px solid ${palette.accent}22`,
              }}
            >
              <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
                <button
                  onClick={() => setShowEmployees(false)}
                  style={{
                    background: !showEmployees ? palette.accent : palette.bg,
                    color: !showEmployees ? palette.white : palette.accent,
                    border: `1.5px solid ${palette.accent}`,
                    borderRadius: 8,
                    padding: "8px 22px",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    cursor: !showEmployees ? "default" : "pointer",
                    boxShadow: !showEmployees ? "0 2px 8px #6366f122" : "none",
                    transition: "background 0.2s",
                  }}
                  disabled={!showEmployees}
                >
                  User List
                </button>
                <button
                  onClick={() => setShowEmployees(true)}
                  style={{
                    background: showEmployees ? palette.accent : palette.bg,
                    color: showEmployees ? palette.white : palette.accent,
                    border: `1.5px solid ${palette.accent}`,
                    borderRadius: 8,
                    padding: "8px 22px",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    cursor: showEmployees ? "default" : "pointer",
                    boxShadow: showEmployees ? "0 2px 8px #6366f122" : "none",
                    transition: "background 0.2s",
                  }}
                  disabled={showEmployees}
                >
                  Employee List
                </button>
              </div>
              {loading ? (
                <p style={{ color: palette.accent, fontWeight: 600, fontSize: "1.1rem" }}>Loading {showEmployees ? "employees" : "users"}...</p>
              ) : error ? (
                <p style={{ color: palette.red, fontWeight: 600 }}>{error}</p>
              ) : (
                <>
                  {/* Add vertical scroll for employee list to prevent overflow */}
                  {showEmployees ? (
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
                  ) : (
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
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Username</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Email</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Role</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent, borderRight: `1px solid ${palette.dark}33` }}>Status</th>
                          <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user, idx) => (
                          <tr
                            key={user.id || user.userId}
                            style={{
                              borderBottom: "1.5px solid #64748b66",
                              background:
                                user.status === "inactive"
                                  ? "#fee2e2"
                                  : idx % 2 === 0
                                  ? palette.white
                                  : palette.bg,
                              transition: "background 0.2s",
                              color: "#1a1a1a",
                            }}
                          >
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{user.id || user.userId}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{user.username}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{user.email}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22`, color: "#1a1a1a", fontWeight: 600 }}>{user.role}</td>
                            <td style={{ padding: 14, borderRight: `1px solid ${palette.dark}22` }}>
                              {user.status === "active" ? (
                                <span style={{ 
                                  color: palette.green, 
                                  fontWeight: 700,
                                  backgroundColor: palette.green + "20",
                                  padding: "4px 12px",
                                  borderRadius: 8,
                                  fontSize: "0.9rem"
                                }}>Active</span>
                              ) : (
                                <span style={{ 
                                  color: palette.red, 
                                  fontWeight: 700,
                                  backgroundColor: palette.red + "20",
                                  padding: "4px 12px",
                                  borderRadius: 8,
                                  fontSize: "0.9rem"
                                }}>Inactive</span>
                              )}
                            </td>
                            <td style={{ padding: 14 }}>
                              <button
                                onClick={() =>
                                  handleToggleStatus(user.id || user.userId)
                                }
                                style={{
                                  background: user.status === "active" ? palette.red : palette.green,
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "7px 16px",
                                  cursor: "pointer",
                                  color: palette.white,
                                  fontWeight: 700,
                                  fontSize: "1.05rem",
                                  boxShadow: "0 2px 8px #6366f122",
                                  transition: "background 0.2s",
                                }}
                              >
                                {user.status === "active" ? "Disable" : "Enable"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                      gap: 14,
                    }}
                  >
                    {showEmployees ? (
                      <>
                        <button
                          onClick={handleEmpPreviousPage}
                          disabled={empCurrentPage === 1}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: `1.5px solid ${palette.accent}`,
                            background: empCurrentPage === 1 ? palette.bg : palette.accent,
                            color: empCurrentPage === 1 ? "#64748b" : palette.white,
                            cursor: empCurrentPage === 1 ? "default" : "pointer",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            transition: "background 0.2s",
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ fontWeight: 700, alignSelf: "center", color: palette.accent, fontSize: "1.08rem" }}>
                          Page {empCurrentPage} of {empTotalPages}
                        </span>
                        <button
                          onClick={handleEmpNextPage}
                          disabled={empCurrentPage === empTotalPages}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: `1.5px solid ${palette.accent}`,
                            background: empCurrentPage === empTotalPages ? palette.bg : palette.accent,
                            color: empCurrentPage === empTotalPages ? "#64748b" : palette.white,
                            cursor: empCurrentPage === empTotalPages ? "default" : "pointer",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            transition: "background 0.2s",
                          }}
                        >
                          Next
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: `1.5px solid ${palette.accent}`,
                            background: currentPage === 1 ? palette.bg : palette.accent,
                            color: currentPage === 1 ? "#64748b" : palette.white,
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
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: `1.5px solid ${palette.accent}`,
                            background: currentPage === totalPages ? palette.bg : palette.accent,
                            color: currentPage === totalPages ? "#64748b" : palette.white,
                            cursor: currentPage === totalPages ? "default" : "pointer",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            transition: "background 0.2s",
                          }}
                        >
                          Next
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        {/* Past Experience Modal */}
        {showExpModal && (
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
                minWidth: 420,
                maxWidth: 600,
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
              
              {/* Personal Information Section */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, color: palette.accent, marginBottom: 16, fontSize: "1.15rem", borderBottom: `2px solid ${palette.accent}`, paddingBottom: 8 }}>
                  Personal Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Employee ID:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.id || selectedEmployee.employeeId}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Full Name:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.name || selectedEmployee.fullName || "N/A"}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Email:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.email || "N/A"}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Phone:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.phone || selectedEmployee.phoneNumber || "N/A"}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Age:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.age || "N/A"}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Gender:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.gender || "N/A"}</p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8, gridColumn: "1 / -1" }}>
                    <strong style={{ color: palette.accent }}>Address:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, color: palette.accent, marginBottom: 16, fontSize: "1.15rem", borderBottom: `2px solid ${palette.accent}`, paddingBottom: 8 }}>
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
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      <span style={{ 
                        color: selectedEmployee.isActive ? palette.green : palette.red,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: selectedEmployee.isActive ? `${palette.green}22` : `${palette.red}22`
                      }}>
                        {selectedEmployee.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Onboarded Date:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      {selectedEmployee.onboardedAt ? new Date(selectedEmployee.onboardedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Educational Information Section */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, color: palette.accent, marginBottom: 16, fontSize: "1.15rem", borderBottom: `2px solid ${palette.accent}`, paddingBottom: 8 }}>
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
                    <strong style={{ color: palette.accent }}>Grade/CGPA:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedEmployee.grade || selectedEmployee.cgpa || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Leave Information Section */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontWeight: 700, color: palette.accent, marginBottom: 16, fontSize: "1.15rem", borderBottom: `2px solid ${palette.accent}`, paddingBottom: 8 }}>
                  Leave Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Total Leaves Allocated:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      {selectedEmployee.totalLeaves || "12"} days
                    </p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Leaves Used:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      <span style={{ color: palette.red, fontWeight: 700 }}>
                        {selectedEmployee.usedLeaves !== undefined ? selectedEmployee.usedLeaves : "0"} days
                      </span>
                    </p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Remaining Leaves:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      <span style={{ color: palette.green, fontWeight: 700 }}>
                        {selectedEmployee.remLeaves !== undefined ? selectedEmployee.remLeaves : "N/A"} days
                      </span>
                    </p>
                  </div>
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                    <strong style={{ color: palette.accent }}>Pending Requests:</strong>
                    <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                      <span style={{ color: palette.orange, fontWeight: 700 }}>
                        {selectedEmployee.pendingLeaves !== undefined ? selectedEmployee.pendingLeaves : "0"} requests
                      </span>
                    </p>
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
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

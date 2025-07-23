// AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaUserShield, FaHome, FaUsers, FaSignOutAlt } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import "../styles/Layout.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

function InfoCard({ title, value, icon, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: "1.7rem", color }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1a2233" }}>{title}</span>
      <span style={{ fontWeight: 600, fontSize: "1.5rem", color: "#4fd1c5" }}>{value}</span>
    </div>
  );
}

export default function AdminDashboard({ active }) {
  const location = useLocation();
  const routePanel = active || (location.pathname.includes("add-user") ? "createForm" : location.pathname.includes("users") ? "userList" : "dashboard");

  const [form, setForm] = useState({ username: "", email: "", password: "", role: "hr" });
  const [created, setCreated] = useState(null);
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
      // Map status boolean to string for UI
      const usersArray = Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []);
      const mappedUsers = usersArray.map(u => ({
        ...u,
        status: u.status === true ? "active" : "inactive"
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
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
          password: form.password,
          role: form.role.toUpperCase(),
          createdBy: 1
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("duplicate")) {
          throw new Error("Email or username already exists. Please use a different one.");
        }
        throw new Error("Registration failed");
      }

      const newUser = await res.json();
      setCreated(newUser);
      setForm({ username: "", email: "", password: "", role: "hr" });
      fetchUsers();
      toast.success(`${newUser.role} added successfully!`);
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
    const user = users.find(u => u.id === id || u.userId === id);
    if (!user) throw new Error("User not found");
    // Toggle status boolean for backend
    const newStatusBool = user.status === "active" ? false : true;
    const res = await fetch(`/api/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatusBool })
    });
    if (!res.ok) throw new Error("Failed to update user status");
    toast.success(`User status updated successfully`);
    fetchUsers(); // refresh list
  } catch (err) {
    toast.error(err.message || "Failed to update user");
    setError(err.message || "Failed to update user");
  } finally {
    setLoading(false);
  }
};

  const safeUsers = Array.isArray(users) ? users : [];
  const totalHRs = safeUsers.filter(u => u.role && u.role.toLowerCase() === "hr").length;
  const totalManagers = safeUsers.filter(u => u.role && u.role.toLowerCase() === "manager").length;

  // Calculate paginated users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = safeUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(safeUsers.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "18px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: "1.7rem", fontWeight: 700, color: "#1a2233", display: "flex", alignItems: "center", gap: 8 }}><FaHome /> Dashboard</span>
          <span style={{ fontSize: "1.2rem", color: "#4fd1c5", display: "flex", alignItems: "center", gap: 8 }}><FaUsers /> Manage Users</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontWeight: 600, color: "#1a2233" }}>Welcome, Admin</span>
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontWeight: 500, color: "#64748b", fontSize: "1.1rem" }}>{new Date().toLocaleTimeString()}</span>
          <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><FaSignOutAlt /> Logout</button>
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 72px)" }}>
        <Sidebar />
        <main style={{ marginLeft: 0, padding: "2rem", width: "100%" }}>
          {routePanel === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
              <InfoCard
                title="Total Active Users"
                value={safeUsers.filter(u => u.status === "active" || u.status === true).length}
                icon={<FaUsers />}
                color="#4fd1c5"
              />
              <InfoCard title="Total HRs" value={totalHRs} icon={<FaUserShield />} color="#38bdf8" />
              <InfoCard title="Total Managers" value={totalManagers} icon={<FaUserPlus />} color="#fbbf24" />
              <InfoCard
                title="Disabled Users"
                value={safeUsers.filter(u => u.status === "inactive" || u.status === false).length}
                icon={<FaSignOutAlt />}
                color="#ef4444"
              />
              <InfoCard
                title="Current Date"
                value={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                icon={<FaHome />}
                color="#64748b"
              />
            </div>
          )}

          {routePanel === "createForm" && (
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32, maxWidth: 600, margin: "0 auto" }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "black" }}><FaUserPlus /> Create HR/Manager Account</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input name="username" value={form.username} onChange={handleChange} required placeholder="Full Name" style={{ padding: 10, borderRadius: 6, border: "1px solid #747f8fff", background: "white", color: "black" }} />
                <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" style={{ padding: 10, borderRadius: 6, border: "1px solid #747f8fff", background: "white", color: "black" }} />
                <select name="role" value={form.role} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #747f8fff", background: "white", color: "black" }}>
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                </select>
                <input name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Password" style={{ padding: 10, borderRadius: 6, border: "1px solid #747f8fff", background: "white", color: "black" }} />
                <button style={{ background: loading ? "#b2f5ea" : "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 600, fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
              </form>
            </div>
          )}

          {routePanel === "userList" && (
            <div style={{ marginTop: 40, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32, maxWidth: 900, margin: "40px auto" }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "black" }}><FaUsers /> User List</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#2e4d6cff" }}>
                    <th style={{ padding: 10, textAlign: "left" }}>Name</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Role</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Email</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 10, textAlign: "left" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 20, color: "#0e1115ff" }}>No users found. Please add a user.</td>
                    </tr>
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u.userId || u.email}>
                        <td style={{ padding: 10, color: "black" }}>{u.username || "N/A"}</td>
                        <td style={{ padding: 10, color: "black" }}>{u.role || "N/A"}</td>
                        <td style={{ padding: 10, color: "black" }}>{u.email || "N/A"}</td>
                        <td style={{ padding: 10, color: "black" }}>{u.status === "active" ? "Active" : "Inactive"}</td>
                        <td style={{ padding: 10 }}>
                          {u.status === "active" ? (
                            <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 500, cursor: "pointer" }} onClick={() => handleToggleStatus(u.userId || u.id)}>Disable</button>
                          ) : (
                            <button style={{ background: "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 500, cursor: "pointer" }} onClick={() => handleToggleStatus(u.userId || u.id)}>Enable</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  style={{ background: currentPage === 1 ? "#e2e8f0" : "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  Previous
                </button>
                <span style={{ fontWeight: 600, color: "#1a2233" }}>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{ background: currentPage === totalPages ? "#e2e8f0" : "#4fd1c5", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

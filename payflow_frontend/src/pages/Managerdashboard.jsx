// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import "../styles/Layout.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../authContext.jsx";
import { Link } from "react-router-dom";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/employees/getAll");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(employees.length / employeesPerPage);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Manager Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "18px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src="/vite.svg" alt="logo" style={{ width: 38, height: 38, marginRight: 10 }} />
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1a2233" }}>Manager Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontWeight: 600, color: "#1a2233" }}>Welcome, {user?.username || "Manager"}</span>
          <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
        </div>
      </nav>
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
          <h2 className="text-2xl font-semibold mb-4">Manager Panel</h2>
          <p>Welcome Manager, oversee your assigned responsibilities.</p>
          <div style={{ marginTop: 32 }}>
            <Link
              to="/Employee/AddEmployee/add"
              style={{
                background: "#4fd1c5",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "1rem"
              }}
            >
              Add Employee
            </Link>
          </div>
          {/* Employee List Section */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.3rem", color: "#2563eb", marginBottom: 16 }}>Employee List</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <div role="alert" style={{ color: "#ef4444", fontWeight: 600 }}>{error}</div>
            ) : (
              <>
                <table style={{
                  width: "100%",
                  maxWidth: 1200,
                  fontSize: "0.95rem",
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px #b2bbc8ff",
                  overflow: "hidden",
                  tableLayout: "auto",
                  borderCollapse: "collapse",
                  margin: "0 auto"
                }}>
                  <thead style={{ background: "linear-gradient(90deg, #4fd1c5 0%, #38bdf8 100%)" }}>
                    <tr>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 80 }}>Employee ID</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 120 }}>Full Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 180 }}>Email</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 60 }}>Age</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 100 }}>Total Exp</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 100 }}>Past Exp</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff", height: 32, width: 120 }}>Onboarded By</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: "1.05rem", height: 32, width: 120 }}>Onboarded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.map(emp => (
                      <tr key={emp.employeeId}>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.employeeId}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.fullName}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32, wordBreak: "break-all" }}>{emp.email}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.age}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.totalExperience}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.pastExperience}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.onboardedBy?.fullName || emp.onboardedBy?.username || "-"}</td>
                        <td style={{ padding: "6px 8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.95rem", height: 32 }}>{emp.onboardedAt ? new Date(emp.onboardedAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? "#e2e8f0" : "#4fd1c5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 16px",
                      fontWeight: 600,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: 600, color: "#1a2233" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      background: currentPage === totalPages ? "#e2e8f0" : "#4fd1c5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 16px",
                      fontWeight: 600,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

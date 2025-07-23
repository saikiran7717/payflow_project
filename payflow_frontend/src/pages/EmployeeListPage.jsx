import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Layout.css";

export default function EmployeeListPage() {
  const navigate = useNavigate();
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
    <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          background: "linear-gradient(90deg, #60a5fa 0%, #38bdf8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(56,189,248,0.12)"
        }}
      >
        &#8592; Back
      </button>
      <h2 style={{
        fontSize: "2rem",
        fontWeight: 700,
        marginBottom: "1.5rem",
        color: "#111",
        letterSpacing: 0.5,
        textAlign: "center",
        textShadow: "0 2px 8px rgba(0,0,0,0.12)"
      }}>
        Employee List
      </h2>
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
                <th style={{ ...thStyle, width: 80, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Employee ID</th>
                <th style={{ ...thStyle, width: 120, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Full Name</th>
                <th style={{ ...thStyle, width: 180, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Email</th>
                <th style={{ ...thStyle, width: 60, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Age</th>
                <th style={{ ...thStyle, width: 100, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Total Exp</th>
                <th style={{ ...thStyle, width: 100, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Past Exp</th>
                <th style={{ ...thStyle, width: 120, color: "#fff", fontWeight: 800, fontSize: "1.05rem", borderRight: "2px solid #fff" }}>Onboarded By</th>
                <th style={{ ...thStyle, width: 120, color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>Onboarded At</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map(emp => (
                <tr key={emp.employeeId}>
                  <td style={tdStyle}>{emp.employeeId}</td>
                  <td style={tdStyle}>{emp.fullName}</td>
                  <td style={{ ...tdStyle, wordBreak: "break-all" }}>{emp.email}</td>
                  <td style={tdStyle}>{emp.age}</td>
                  <td style={tdStyle}>{emp.totalExperience}</td>
                  <td style={tdStyle}>{emp.pastExperience}</td>
                  <td style={tdStyle}>{emp.onboardedBy?.fullName || emp.onboardedBy?.username || "-"}</td>
                  <td style={tdStyle}>{emp.onboardedAt ? new Date(emp.onboardedAt).toLocaleString() : "-"}</td>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

const thStyle = {
  padding: "6px 8px",
  textAlign: "center",
  color: "#2563eb",
  fontWeight: 700,
  borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0",
  fontSize: "0.95rem",
  height: 32
};

const tdStyle = {
  padding: "6px 8px",
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0",
  textAlign: "center",
  fontSize: "0.95rem",
  height: 32
};

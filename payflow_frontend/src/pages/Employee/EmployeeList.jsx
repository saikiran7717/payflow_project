import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Layout.css";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(employees.length / employeesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter(emp => emp.userId !== id));
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: currentStatus === "active" ? "disabled" : "active" })
      });

      const data = await response.text();

      if (response.ok) {
        alert(`User ${currentStatus === "active" ? "deactivated" : "activated"} successfully.`);
        setEmployees(prev =>
          prev.map(emp =>
            emp.userId === userId ? { ...emp, status: currentStatus === "active" ? "disabled" : "active" } : emp
          )
        );
      } else {
        alert("Failed to update status: " + data);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 0, padding: "1rem", width: "100%", overflowX: "auto" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#2563eb", letterSpacing: 0.5 }}>
          Employee List
        </h2>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="spinner" style={{
              width: 22,
              height: 22,
              border: "3px solid #b2f5ea",
              borderTop: "3px solid #4fd1c5",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              marginRight: 8,
              display: "inline-block",
            }}></span>
            <span style={{ color: "#2563eb", fontWeight: 600 }}>Loading employees...</span>
          </div>
        ) : error ? (
          <div role="alert" style={{ color: "#ef4444", fontWeight: 600 }}>{error}</div>
        ) : (
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <table aria-label="Employee list" style={{
              minWidth: 1200,
              width: "100%",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #b2bbc8ff",
              overflow: "hidden",
              tableLayout: "fixed",
              borderCollapse: "collapse"
            }}>
              <thead style={{ background: "#e0f2fe" }}>
                <tr>
                  <th style={thStyle}>Employee ID</th>
                  <th style={thStyle}>Full Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Total Experience</th>
                  <th style={thStyle}>Past Experience</th>
                  <th style={thStyle}>Onboarded By</th>
                  <th style={thStyle}>Onboarded At</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map(emp => (
                  <tr key={emp.employeeId}>
                    <td style={tdStyle}>{emp.employeeId}</td>
                    <td style={tdStyle}>{emp.fullName}</td>
                    <td style={tdStyle}>{emp.email}</td>
                    <td style={tdStyle}>{emp.age}</td>
                    <td style={tdStyle}>{emp.totalExperience}</td>
                    <td style={tdStyle}>{emp.pastExperience}</td>
                    <td style={tdStyle}>{emp.onboardedBy?.fullName || emp.onboardedBy?.username || "-"}</td>
                    <td style={tdStyle}>{emp.onboardedAt ? new Date(emp.onboardedAt).toLocaleString() : "-"}</td>
                    <td style={{ ...tdStyle, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={() => handleDelete(emp.employeeId)}
                        style={deleteBtn}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleStatusChange(emp.userId, emp.status)}
                        style={{
                          background: emp.status === "active" ? "#eab308" : "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 16px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {emp.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 💡 Extracted styles
const thStyle = {
  padding: 12,
  textAlign: "left",
  color: "#2563eb",
  fontWeight: 700,
  borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0"
};

const tdStyle = {
  padding: 12,
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
  borderRight: "1px solid #e2e8f0"
};

const deleteBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s"
};

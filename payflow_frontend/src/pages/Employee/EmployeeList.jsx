import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { FaUsers } from "react-icons/fa";
import "../../styles/Layout.css";
import Sidebar from "../../components/Sidebar";

const palette = {
  blue: "#93c5fd",
  teal: "#99f6e4",
  yellow: "#fde68a",
  orange: "#fdba74",
  red: "#fecaca",
  green: "#bbf7d0",
  purple: "#ddd6fe",
  gray: "#e5e7eb",
  dark: "#64748b",
  light: "#f8fafc",
  accent: "#6366f1",
  bg: "#f1f5f9",
  white: "#fff",
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;

  const [showExpModal, setShowExpModal] = useState(false);
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState("");
  const [expData, setExpData] = useState([]);
  const [expEmp, setExpEmp] = useState(null);

  const handleShowPastExp = async (emp) => {
    setShowExpModal(true);
    setExpLoading(true);
    setExpError("");
    setExpEmp(emp);
    try {
      const res = await fetch(`/api/employees/${emp.employeeId}/experiences`);
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

  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(employees.length / employeesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar />
      <div
        style={{
          marginTop: 40,
          background: `linear-gradient(120deg, ${palette.light} 80%, #e0e7ef 100%)`,
          borderRadius: 20,
          boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
          padding: 36,
          maxWidth: 1200,
          margin: "40px auto",
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
          <p style={{ color: palette.accent, fontWeight: 600, fontSize: "1.1rem" }}>
            Loading employees...
          </p>
        ) : error ? (
          <p style={{ color: palette.red, fontWeight: 600 }}>{error}</p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: "1.05rem",
                color: palette.dark,
                background: "transparent",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px #6366f111",
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
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Full Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Manager</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}>Past Experience</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map((emp, idx) => (
                  <tr
                    key={emp.employeeId}
                    style={{
                      borderBottom: "1.5px solid #e2e8f0",
                      background: idx % 2 === 0 ? palette.white : palette.bg,
                      transition: "background 0.2s",
                    }}
                  >
                    <td style={tdStyle}>{emp.employeeId}</td>
                    <td style={tdStyle}>{emp.fullName}</td>
                    <td style={tdStyle}>{emp.email}</td>
                    <td style={tdStyle}>{emp.age}</td>
                    <td style={tdStyle}>{emp.phone}</td>
                    <td style={tdStyle}>
                      {emp.manager ? `${emp.manager.username} (${emp.manager.email})` : 'No Manager'}
                    </td>
                    <td style={tdStyle}>
                      <button
                        style={{
                          background: emp.isActive ? palette.green : palette.red,
                          color: palette.white,
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 16px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontSize: "1rem",
                          boxShadow: "0 2px 8px #6366f122",
                          marginRight: 8,
                        }}
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `/api/employees/${emp.employeeId}/status`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: !emp.isActive }),
                              }
                            );
                            if (!res.ok) throw new Error("Failed to update status");
                            setEmployees((prev) =>
                              prev.map((e) =>
                                e.employeeId === emp.employeeId
                                  ? { ...e, isActive: !e.isActive }
                                  : e
                              )
                            );
                          } catch (err) {
                            alert("Failed to update status");
                          }
                        }}
                      >
                        {emp.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                    <td style={tdStyle}>
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
                        }}
                        onClick={() => handleShowPastExp(emp)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 14 }}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: `1.5px solid ${palette.accent}`,
                  background: currentPage === 1 ? palette.bg : palette.accent,
                  color: currentPage === 1 ? palette.gray : palette.white,
                  cursor: currentPage === 1 ? "default" : "pointer",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                Previous
              </button>
              <span
                style={{
                  fontWeight: 700,
                  alignSelf: "center",
                  color: palette.accent,
                  fontSize: "1.08rem",
                }}
              >
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
                  color: currentPage === totalPages ? palette.gray : palette.white,
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                Next
              </button>
            </div>
          </>
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
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleCloseExpModal}
          >
            <div
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
              onClick={(e) => e.stopPropagation()}
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
              <h3 style={{ fontWeight: 800, color: palette.accent, marginBottom: 18 }}>
                Past Experiences for {expEmp?.fullName || expEmp?.email}
              </h3>
              {expLoading ? (
                <p style={{ color: palette.accent, fontWeight: 600 }}>Loading...</p>
              ) : expError ? (
                <p style={{ color: palette.red, fontWeight: 600 }}>{expError}</p>
              ) : expData.length === 0 ? (
                <p style={{ color: palette.gray, fontWeight: 600 }}>No past experiences found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead>
                    <tr style={{ background: palette.bg }}>
                      <th style={thStyle}>Company</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expData.map((exp, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? palette.white : palette.bg,
                          color: palette.dark,
                        }}
                      >
                        <td style={tdStyle}>{exp.companyName}</td>
                        <td style={tdStyle}>{exp.role}</td>
                        <td style={tdStyle}>{exp.yearsOfExperience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted styles
const thStyle = {
  padding: 12,
  textAlign: "left",
  color: "#2563eb",
  fontWeight: 700,
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: 12,
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "normal",
};

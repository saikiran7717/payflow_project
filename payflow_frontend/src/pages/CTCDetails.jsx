import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/DynamicNavigation.jsx";
import { FaCalendarAlt, FaHome, FaUser, FaSignOutAlt, FaFileAlt, FaInfoCircle, FaDollarSign, FaMoneyBillWave, FaPiggyBank, FaChartLine, FaHistory, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const palette = {
  blue: "#1e40af",
  teal: "#0d9488",
  yellow: "#f59e0b",
  orange: "#ea580c",
  red: "#dc2626",
  green: "#16a34a",
  purple: "#9333ea",
  gray: "#6b7280",
  dark: "#374151",
  darkest: "#1f2937",
  light: "#f8fafc",
  accent: "#4f46e5",
  bg: "#f1f5f9",
  white: "#fff",
  lightBlue: "#3b82f6",
};

// Employee Sidebar Component - Same as other pages
const EmployeeSidebar = ({ activePage = "ctc-details" }) => {
  const handleLogout = async () => {
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
  };

  const linkStyle = (path) => ({
    display: "block",
    padding: "13px 36px",
    fontWeight: 700,
    textDecoration: "none",
    background: activePage === path ? palette.accent + "22" : "transparent",
    color: activePage === path ? palette.accent : palette.dark,
    borderLeft: activePage === path ? `4px solid ${palette.accent}` : "4px solid transparent",
    borderRadius: activePage === path ? "0 18px 18px 0" : "0 18px 18px 0",
    margin: "2px 0",
    fontSize: "1.08rem",
    letterSpacing: 0.2,
    transition: "background 0.18s, color 0.18s",
  });

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
            color: palette.accent,
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
                  background: `linear-gradient(90deg, ${palette.red} 60%, #f87171 100%)`,
                  color: palette.white,
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
};

export default function CTCDetails() {
  const [ctcData, setCTCData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [ctcHistory, setCTCHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchCTCData = async () => {
      try {
        // Get employee data from localStorage
        const userData = localStorage.getItem("payflow_user");
        if (!userData) {
          setError("Please login to view CTC details");
          toast.error("Please login first", { position: "top-center" });
          setTimeout(() => window.location.href = "/login", 2000);
          return;
        }

        const user = JSON.parse(userData);
        const employeeId = user.employeeId || user.id;

        if (!employeeId) {
          setError("Employee ID not found. Please login again.");
          return;
        }

        setEmployee(user);
        console.log("Fetching CTC data for employee ID:", employeeId);

        // Fetch CTC data from backend - get the latest CTC record
        const response = await fetch(`/api/ctc/employee/${employeeId}/latest`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("CTC API response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("CTC data received:", data);
          setCTCData(data);
          setError(null);
        } else if (response.status === 404) {
          // CTC not found
          setCTCData(null);
          setError(null);
        } else if (response.status === 403) {
          setError("Access denied. Please login again.");
          toast.error("Access denied", { position: "top-center" });
        } else {
          const errorText = await response.text();
          console.error("CTC API error:", errorText);
          setError("Failed to fetch CTC details");
          toast.error("Failed to fetch CTC details", { position: "top-center" });
        }
      } catch (err) {
        console.error("Error fetching CTC data:", err);
        setError("Network error. Please check your connection.");
        toast.error("Network error loading CTC details", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchCTCData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchCTCHistory = async () => {
    const userData = localStorage.getItem("payflow_user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const employeeId = user.employeeId || user.id;

    if (!employeeId) return;

    setHistoryLoading(true);
    try {
      // Try the history endpoint first
      let response = await fetch(`/api/ctc/employee/${employeeId}/history`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const history = await response.json();
        setCTCHistory(history);
        setShowHistory(true);
      } else if (response.status === 404) {
        // Fallback to main CTC endpoint to get current record
        response = await fetch(`/api/ctc/employee/${employeeId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const currentCTC = await response.json();
          setCTCHistory([currentCTC]);
          setShowHistory(true);
        } else {
          toast.error("No CTC history found", { position: "top-center" });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching CTC history:", err);
      toast.error("Failed to load CTC history", { position: "top-center" });
    } finally {
      setHistoryLoading(false);
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
      <DynamicNavigation />

      <div style={{ display: "flex", flex: 1 }}>
        <EmployeeSidebar activePage="ctc-details" />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          <div
            style={{
              background: palette.white,
              borderRadius: 20,
              boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
              padding: 36,
              border: `1.5px solid ${palette.accent}22`,
            }}
          >
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: palette.accent,
                fontSize: "1.5rem",
                letterSpacing: 0.2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FaDollarSign /> CTC Details
                {employee?.fullName && (
                  <span style={{ 
                    color: palette.gray, 
                    fontSize: "1.2rem", 
                    fontWeight: 600,
                    marginLeft: 8
                  }}>
                    - {employee.fullName}
                  </span>
                )}
              </div>
              
              {ctcData && (
                <button
                  onClick={fetchCTCHistory}
                  disabled={historyLoading}
                  style={{
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.lightBlue} 100%)`,
                    color: palette.white,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 20px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: historyLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 3px 12px rgba(99, 102, 241, 0.3)",
                    transition: "all 0.2s ease",
                    opacity: historyLoading ? 0.7 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!historyLoading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 5px 20px rgba(99, 102, 241, 0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!historyLoading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 3px 12px rgba(99, 102, 241, 0.3)";
                    }
                  }}
                >
                  <FaHistory />
                  {historyLoading ? "Loading..." : "CTC History"}
                </button>
              )}
            </h2>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "4px solid rgba(99, 102, 241, 0.3)",
                    borderTop: "4px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem",
                  }}
                />
                <p style={{ color: palette.accent, fontWeight: 600, fontSize: "1.1rem" }}>
                  Loading CTC details...
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <FaInfoCircle 
                  style={{ 
                    fontSize: "3rem", 
                    color: palette.red, 
                    marginBottom: 16 
                  }} 
                />
                <p style={{ color: palette.red, fontWeight: 600, fontSize: "1.1rem" }}>
                  {error}
                </p>
              </div>
            ) : !ctcData ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <FaInfoCircle 
                  style={{ 
                    fontSize: "4rem", 
                    color: palette.orange, 
                    marginBottom: 24 
                  }} 
                />
                <h3 style={{ 
                  color: palette.orange, 
                  fontWeight: 700, 
                  fontSize: "1.5rem", 
                  marginBottom: 16 
                }}>
                  CTC Details Not Available
                </h3>
                <p style={{ 
                  color: palette.gray, 
                  fontWeight: 500, 
                  fontSize: "1.1rem", 
                  lineHeight: 1.6,
                  maxWidth: 500,
                  margin: "0 auto 24px auto"
                }}>
                  Your CTC (Cost to Company) details have not been configured yet. 
                  Please contact your HR department or Manager to set up your compensation details.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                  <div style={{
                    background: `${palette.accent}11`,
                    padding: "16px 24px",
                    borderRadius: 12,
                    border: `2px solid ${palette.accent}33`,
                    textAlign: "left"
                  }}>
                    <h4 style={{ color: palette.accent, fontWeight: 700, marginBottom: 8 }}>
                      Contact HR Department
                    </h4>
                    <p style={{ color: palette.dark, margin: 0, fontSize: "0.95rem" }}>
                      Email: hr@company.com<br />
                      Phone: +91-XXXX-XXXX-XX
                    </p>
                  </div>
                  <div style={{
                    background: `${palette.green}11`,
                    padding: "16px 24px",
                    borderRadius: 12,
                    border: `2px solid ${palette.green}33`,
                    textAlign: "left"
                  }}>
                    <h4 style={{ color: palette.green, fontWeight: 700, marginBottom: 8 }}>
                      Contact Your Manager
                    </h4>
                    <p style={{ color: palette.dark, margin: 0, fontSize: "0.95rem" }}>
                      Check with your direct manager<br />
                      for CTC setup assistance
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* CTC Overview Cards */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: 20, 
                  marginBottom: 32 
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${palette.accent}15 0%, ${palette.accent}05 100%)`,
                    borderRadius: 16,
                    padding: 20,
                    border: `2px solid ${palette.accent}33`,
                    textAlign: "center"
                  }}>
                    <FaMoneyBillWave style={{ fontSize: "2rem", color: palette.accent, marginBottom: 8 }} />
                    <h3 style={{ color: palette.accent, fontWeight: 700, margin: "8px 0 4px 0" }}>
                      Annual CTC
                    </h3>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.darkest, margin: 0 }}>
                      {formatCurrency(ctcData.totalCtc || 0)}
                    </p>
                  </div>

                  <div style={{
                    background: `linear-gradient(135deg, ${palette.green}15 0%, ${palette.green}05 100%)`,
                    borderRadius: 16,
                    padding: 20,
                    border: `2px solid ${palette.green}33`,
                    textAlign: "center"
                  }}>
                    <FaPiggyBank style={{ fontSize: "2rem", color: palette.green, marginBottom: 8 }} />
                    <h3 style={{ color: palette.green, fontWeight: 700, margin: "8px 0 4px 0" }}>
                      Monthly Gross
                    </h3>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.darkest, margin: 0 }}>
                      {formatCurrency(ctcData.monthlySalary || (ctcData.totalCtc / 12) || 0)}
                    </p>
                  </div>

                  <div style={{
                    background: `linear-gradient(135deg, ${palette.lightBlue}15 0%, ${palette.lightBlue}05 100%)`,
                    borderRadius: 16,
                    padding: 20,
                    border: `2px solid ${palette.lightBlue}33`,
                    textAlign: "center"
                  }}>
                    <FaChartLine style={{ fontSize: "2rem", color: palette.lightBlue, marginBottom: 8 }} />
                    <h3 style={{ color: palette.lightBlue, fontWeight: 700, margin: "8px 0 4px 0" }}>
                      Net Monthly Salary
                    </h3>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.darkest, margin: 0 }}>
                      {formatCurrency(ctcData.netMonthlySalary || 0)}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                      {ctcData.effectiveFrom && `Effective: ${new Date(ctcData.effectiveFrom).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}`}
                    </p>
                  </div>
                </div>

                {/* Detailed CTC Breakdown */}
                <div style={{
                  background: `linear-gradient(120deg, ${palette.bg} 80%, #e0e7ef 100%)`,
                  borderRadius: 16,
                  padding: 28,
                  border: `2px solid ${palette.accent}22`,
                }}>
                  <h3 style={{ 
                    color: palette.accent, 
                    fontWeight: 700, 
                    marginBottom: 20,
                    fontSize: "1.3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}>
                    <FaChartLine /> CTC Breakdown
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                    {/* Basic Salary */}
                    <div style={{
                      background: palette.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${palette.gray}33`,
                    }}>
                      <h4 style={{ color: palette.accent, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                        Basic Salary
                      </h4>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.darkest, margin: 0 }}>
                        {formatCurrency(ctcData.basicSalary || 0)}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                        Monthly: {formatCurrency((ctcData.basicSalary / 12) || 0)}
                      </p>
                    </div>

                    {/* Other Allowances */}
                    <div style={{
                      background: palette.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${palette.gray}33`,
                    }}>
                      <h4 style={{ color: palette.blue, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                        Other Allowances
                      </h4>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.darkest, margin: 0 }}>
                        {formatCurrency(ctcData.allowances || 0)}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                        Monthly: {formatCurrency((ctcData.allowances / 12) || 0)}
                      </p>
                    </div>

                    {/* Bonuses */}
                    <div style={{
                      background: palette.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${palette.gray}33`,
                    }}>
                      <h4 style={{ color: palette.orange, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                        Annual Bonus
                      </h4>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.darkest, margin: 0 }}>
                        {formatCurrency(ctcData.bonuses || 0)}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                        Paid annually
                      </p>
                    </div>

                    {/* PF Contribution */}
                    <div style={{
                      background: palette.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${palette.gray}33`,
                    }}>
                      <h4 style={{ color: palette.purple, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                        PF Contribution
                      </h4>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.darkest, margin: 0 }}>
                        {formatCurrency(ctcData.pfContribution || 0)}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                        Monthly: {formatCurrency((ctcData.pfContribution / 12) || 0)}
                      </p>
                    </div>

                    {/* Gratuity */}
                    <div style={{
                      background: palette.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${palette.gray}33`,
                    }}>
                      <h4 style={{ color: palette.yellow, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                        Gratuity
                      </h4>
                      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.darkest, margin: 0 }}>
                        {formatCurrency(ctcData.gratuity || 0)}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                        Annual provision
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CTC History Modal */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHistory(false);
            }
          }}
        >
          <div
            style={{
              background: palette.white,
              borderRadius: 20,
              padding: 32,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              border: `2px solid ${palette.accent}22`,
              minWidth: 600,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: `2px solid ${palette.accent}22`,
              }}
            >
              <h3
                style={{
                  color: palette.accent,
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <FaHistory /> CTC History
                {employee?.fullName && (
                  <span style={{ 
                    color: palette.gray, 
                    fontSize: "1.2rem", 
                    fontWeight: 600 
                  }}>
                    - {employee.fullName}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: palette.gray,
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 8,
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.color = palette.red)}
                onMouseOut={(e) => (e.target.style.color = palette.gray)}
              >
                <FaTimes />
              </button>
            </div>

            {ctcHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <FaInfoCircle 
                  style={{ 
                    fontSize: "3rem", 
                    color: palette.orange, 
                    marginBottom: 16 
                  }} 
                />
                <p style={{ color: palette.gray, fontWeight: 600 }}>
                  No CTC history records found.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ctcHistory.map((record, index) => (
                  <div
                    key={record.id || index}
                    style={{
                      background: index === 0 
                        ? `linear-gradient(135deg, ${palette.accent}15 0%, ${palette.accent}05 100%)`
                        : `linear-gradient(135deg, ${palette.bg} 80%, #e0e7ef 100%)`,
                      borderRadius: 16,
                      padding: 20,
                      border: index === 0 
                        ? `2px solid ${palette.accent}44`
                        : `2px solid ${palette.gray}22`,
                      position: "relative",
                    }}
                  >
                    {index === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: -8,
                          right: 20,
                          background: palette.accent,
                          color: palette.white,
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        Current
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h4 style={{ 
                        color: index === 0 ? palette.accent : palette.dark, 
                        fontWeight: 700, 
                        margin: 0,
                        fontSize: "1.2rem"
                      }}>
                        {formatCurrency(record.totalCtc || 0)}
                        <span style={{ fontSize: "0.9rem", color: palette.gray, marginLeft: 8 }}>
                          Annual CTC
                        </span>
                      </h4>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ 
                          margin: 0, 
                          color: palette.gray, 
                          fontWeight: 600,
                          fontSize: "0.95rem"
                        }}>
                          Effective From
                        </p>
                        <p style={{ 
                          margin: 0, 
                          color: palette.dark, 
                          fontWeight: 700,
                          fontSize: "1rem"
                        }}>
                          {record.effectiveFrom 
                            ? new Date(record.effectiveFrom).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                      gap: 12,
                      marginTop: 16
                    }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", color: palette.gray, fontSize: "0.85rem", fontWeight: 600 }}>
                          Basic Salary
                        </p>
                        <p style={{ margin: 0, color: palette.dark, fontWeight: 700, fontSize: "1rem" }}>
                          {formatCurrency(record.basicSalary || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", color: palette.gray, fontSize: "0.85rem", fontWeight: 600 }}>
                          Monthly Gross
                        </p>
                        <p style={{ margin: 0, color: palette.dark, fontWeight: 700, fontSize: "1rem" }}>
                          {formatCurrency(record.monthlySalary || (record.totalCtc / 12) || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", color: palette.gray, fontSize: "0.85rem", fontWeight: 600 }}>
                          Net Monthly
                        </p>
                        <p style={{ margin: 0, color: palette.dark, fontWeight: 700, fontSize: "1rem" }}>
                          {formatCurrency(record.netMonthlySalary || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", color: palette.gray, fontSize: "0.85rem", fontWeight: 600 }}>
                          Allowances
                        </p>
                        <p style={{ margin: 0, color: palette.dark, fontWeight: 700, fontSize: "1rem" }}>
                          {formatCurrency(record.allowances || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              marginTop: 24, 
              paddingTop: 16, 
              borderTop: `1px solid ${palette.gray}33`,
              textAlign: "center"
            }}>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: `linear-gradient(135deg, ${palette.gray} 0%, ${palette.dark} 100%)`,
                  color: palette.white,
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

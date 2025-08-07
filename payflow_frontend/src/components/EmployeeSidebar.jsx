import React, { useCallback } from "react";
import { FaSignOutAlt } from "react-icons/fa";

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
              <a href="/employee-payslips" style={linkStyle("employee-payslips")}>
                Payslip Generation
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

export default EmployeeSidebar;

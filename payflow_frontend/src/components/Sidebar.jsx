import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  let localUser = user;
  if (!localUser) {
    try {
      localUser = JSON.parse(localStorage.getItem("payflow_user"));
    } catch {
      localUser = null;
    }
  }

  const handleLogout = async () => {
    let url =
      localUser && localUser.role === "admin"
        ? "/api/admins/logout"
        : "/api/users/logout";
    try {
      await fetch(url, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout API failed", err);
    }
    localStorage.removeItem("payflow_user");
    logout();
    window.location.href = "/login";
  };

  const palette = {
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
  const linkStyle = (path) => ({
    display: "block",
    padding: "13px 36px",
    fontWeight: 700,
    textDecoration: "none",
    background: location.pathname === path ? palette.accent + "22" : "transparent",
    color: location.pathname === path ? palette.accent : palette.dark,
    borderLeft: location.pathname === path ? `4px solid ${palette.accent}` : "4px solid transparent",
    borderRadius: location.pathname === path ? "0 18px 18px 0" : "0 18px 18px 0",
    margin: "2px 0",
    fontSize: "1.08rem",
    letterSpacing: 0.2,
    transition: "background 0.18s, color 0.18s",
  });

  // Determine dashboard path based on role (case-insensitive)
  let dashboardPath = "/";
  if (localUser?.role) {
    const role = String(localUser.role).toLowerCase();
    if (role === "admin") dashboardPath = "/admin";
    else if (role === "hr") dashboardPath = "/hr";
    else if (role === "manager") dashboardPath = "/manager";
  }

  return (
    <aside
      className="sidebar"
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
            {/* Dashboard link for all logged-in users */}
            {localUser && (
              <li>
                <Link to={dashboardPath} style={linkStyle(dashboardPath)}>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Admin-specific links */}
            {localUser && localUser.role === "admin" && (
              <>
                <li>
                  <Link to="/admin/add-user" style={linkStyle("/admin/add-user")}>
                    Add HR/Manager
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" style={linkStyle("/admin/users")}>
                    Show User List
                  </Link>
                </li>
              </>
            )}

            {/* HR (non-admin) links */}
            {localUser && localUser.role !== "admin" && (
              <>
                <li>
                  <Link to="/employees" style={linkStyle("/employees")}>
                    Employee List
                  </Link>
                </li>
                <li>
                  <Link to="/Employee/AddEmployee/add" style={linkStyle("/Employee/AddEmployee/add")}>
                    Add Employee
                  </Link>
                </li>
              </>
            )}

            {/* Logout button */}
            {localUser && (
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
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

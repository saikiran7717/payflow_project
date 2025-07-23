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

  const linkStyle = (path) => ({
    display: "block",
    padding: "12px 32px",
    fontWeight: 600,
    textDecoration: "none",
    background: location.pathname === path ? "#e0f7fa" : "transparent",
    color: location.pathname === path ? "#0f766e" : "#1a2233",
    borderLeft: location.pathname === path ? "4px solid #0f766e" : "4px solid transparent",
  });

  return (
    <aside
      className="sidebar"
      style={{
        background: "#fff",
        minWidth: 220,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: "32px 0",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: "100%" }}>
        <h2
          style={{
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#1a2233",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          PayFlow AI
        </h2>
        <nav style={{ width: "100%" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
            {localUser && localUser.role === "admin" && (
              <>
                <li>
                  <Link to="/admin" style={linkStyle("/admin")}>
                    Admin Dashboard
                  </Link>
                </li>
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
            <li>
              <Link to="/admin/employees" style={linkStyle("/admin/employees")}>
                Employees
              </Link>
            </li>
            {localUser && (
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "12px 32px",
                    width: "100%",
                    textAlign: "left",
                    fontSize: "1.1rem",
                    marginTop: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 2px 8px rgba(239,68,68,0.09)",
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

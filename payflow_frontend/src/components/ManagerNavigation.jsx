import React, { useState, useEffect } from "react";
import { FaHome, FaUser } from "react-icons/fa";
import { useAuth } from "../authContext.jsx";

const palette = {
  blue: "#93c5fd",
  teal: "#99f6e4",
  yellow: "#fde68a",
  orange: "#fdba74",
  red: "#ef4444",
  green: "#22c55e",
  purple: "#ddd6fe",
  gray: "#9ca3af",
  dark: "#374151",
  darkest: "#1f2937",
  light: "#f8fafc",
  accent: "#6366f1",
  bg: "#f1f5f9",
  white: "#fff",
};

const ManagerNavigation = React.memo(() => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user details when user object is available
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Get current user from context or localStorage
      let currentUser = user;
      if (!currentUser) {
        try {
          const storedUser = localStorage.getItem("payflow_user");
          currentUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
          console.error("Error parsing stored user:", error);
          currentUser = null;
        }
      }
      
      // Fetch current user details from the backend
      if (currentUser && !userDetails) {
        try {
          const response = await fetch(`/api/employees/current-user-role`, {
            method: "GET",
            credentials: "include",
          });
          
          if (response.ok) {
            const details = await response.json();
            setUserDetails(details);
          }
        } catch (error) {
          console.error("Error fetching current user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [user, userDetails]);

  // Helper function to get user display name
  const getUserDisplayName = () => {
    // First try to get user from context
    let currentUser = user;
    
    // If no user from context, try localStorage
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem("payflow_user");
        currentUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Error parsing stored user:", error);
        currentUser = null;
      }
    }
    
    if (!currentUser) return "Manager";
    
    // If we have fetched user details from API, use them first (this contains the correct username)
    if (userDetails && userDetails.username) {
      return userDetails.username;
    }
    
    // Try original user object properties (from login response)
    if (currentUser.username) return currentUser.username;
    if (currentUser.name) return currentUser.name;
    if (currentUser.fullName) return currentUser.fullName;
    if (currentUser.displayName) return currentUser.displayName;
    if (currentUser.firstName && currentUser.lastName) return `${currentUser.firstName} ${currentUser.lastName}`;
    if (currentUser.firstName) return currentUser.firstName;
    if (currentUser.lastName) return currentUser.lastName;
    
    // Try email-based username extraction
    if (currentUser.email) {
      const emailUsername = currentUser.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailUsername.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Try user ID if it's meaningful
    if (currentUser.userId && typeof currentUser.userId === 'string') {
      return `User ${currentUser.userId}`;
    }
    
    // Fallback based on role
    if (currentUser.role) {
      const role = currentUser.role.toLowerCase();
      return role === 'manager' ? 'Manager' : role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    // Final fallback
    return "Manager";
  };

  // Debug logging (remove in production)
  console.log("ManagerNavigation - Current user:", user);
  console.log("ManagerNavigation - User details:", userDetails);
  console.log("ManagerNavigation - Display name:", getUserDisplayName());

  return (
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
          <FaHome /> Manager Dashboard
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ fontWeight: 700, color: palette.dark, fontSize: "1.1rem", letterSpacing: 0.2 }}>
          Welcome, {getUserDisplayName()}
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
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </nav>
  );
});

ManagerNavigation.displayName = "ManagerNavigation";

export default ManagerNavigation;

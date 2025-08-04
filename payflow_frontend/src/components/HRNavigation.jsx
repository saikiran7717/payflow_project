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

const HRNavigation = React.memo(() => {
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
      if (user && user.userId && !userDetails) {
        try {
          const response = await fetch(`/api/employees/${user.userId}`, {
            method: "GET",
            credentials: "include",
          });
          
          if (response.ok) {
            const details = await response.json();
            setUserDetails(details);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [user, userDetails]);

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return "HR";
    
    // If we have fetched user details, use them
    if (userDetails) {
      if (userDetails.username) return userDetails.username;
      if (userDetails.name) return userDetails.name;
      if (userDetails.fullName) return userDetails.fullName;
      if (userDetails.firstName && userDetails.lastName) return `${userDetails.firstName} ${userDetails.lastName}`;
      if (userDetails.firstName) return userDetails.firstName;
      if (userDetails.email) {
        const emailUsername = userDetails.email.split('@')[0];
        return emailUsername;
      }
    }
    
    // Try original user object properties
    if (user.username) return user.username;
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername;
    }
    
    // Fallback to role or HR
    return user.role || "HR";
  };

  // Debug logging (remove in production)
  console.log("HRNavigation - Current user:", user);
  console.log("HRNavigation - User details:", userDetails);
  console.log("HRNavigation - Display name:", getUserDisplayName());

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
          <FaHome /> HR Dashboard
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

HRNavigation.displayName = "HRNavigation";

export default HRNavigation;

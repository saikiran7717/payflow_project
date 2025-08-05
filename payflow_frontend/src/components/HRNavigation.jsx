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
      // Get user from localStorage if context user is not available
      let currentUser = user;
      if (!currentUser) {
        try {
          const storedUser = localStorage.getItem("payflow_user");
          currentUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      if (currentUser && !userDetails) {
        try {
          let response;
          const userRole = currentUser.role?.toLowerCase();

          console.log("Fetching user details for role:", userRole);

          // Use different API endpoints based on user role
          if (userRole === "hr") {
            // For HR users, fetch from users/me API (this endpoint exists)
            console.log("Fetching HR user details from /api/users/me");
            response = await fetch(`/api/users/me`, {
              method: "GET",
              credentials: "include",
            });
          } else if (userRole === "admin") {
            // For admin users, fetch from admin API
            console.log("Fetching admin user details from /api/admins/me");
            response = await fetch(`/api/admins/me`, {
              method: "GET",
              credentials: "include",
            });
          } else {
            // For employees or others, fetch from employees API
            const userId = currentUser.userId || currentUser.id;
            console.log("Fetching employee user details from /api/employees/", userId);
            response = await fetch(`/api/employees/${userId}`, {
              method: "GET",
              credentials: "include",
            });
          }
          
          if (response && response.ok) {
            const details = await response.json();
            console.log("Successfully fetched user details:", details);
            setUserDetails(details);
          } else {
            console.log("Failed to fetch user details. Response status:", response?.status);
            if (response) {
              const errorText = await response.text();
              console.log("Error response:", errorText);
            }
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
    // Get user from localStorage if context user is not available
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem("payflow_user");
        currentUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }

    if (!currentUser) return "HR";

    // Debug: Log the current user object to see what fields are available
    console.log("getUserDisplayName - currentUser object:", currentUser);
    console.log("getUserDisplayName - userDetails object:", userDetails);
    
    // Priority 1: Try original user object properties first (from login response)
    if (currentUser.username) {
      console.log("Using username from currentUser:", currentUser.username);
      return currentUser.username;
    }
    if (currentUser.name) {
      console.log("Using name from currentUser:", currentUser.name);
      return currentUser.name;
    }
    if (currentUser.fullName) {
      console.log("Using fullName from currentUser:", currentUser.fullName);
      return currentUser.fullName;
    }
    if (currentUser.firstName && currentUser.lastName) {
      const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
      console.log("Using firstName + lastName from currentUser:", fullName);
      return fullName;
    }
    if (currentUser.firstName) {
      console.log("Using firstName from currentUser:", currentUser.firstName);
      return currentUser.firstName;
    }
    
    // Priority 2: If we have fetched user details from API, use them
    if (userDetails) {
      if (userDetails.username) {
        console.log("Using username from userDetails:", userDetails.username);
        return userDetails.username;
      }
      if (userDetails.name) {
        console.log("Using name from userDetails:", userDetails.name);
        return userDetails.name;
      }
      if (userDetails.fullName) {
        console.log("Using fullName from userDetails:", userDetails.fullName);
        return userDetails.fullName;
      }
      if (userDetails.firstName && userDetails.lastName) {
        const fullName = `${userDetails.firstName} ${userDetails.lastName}`;
        console.log("Using firstName + lastName from userDetails:", fullName);
        return fullName;
      }
      if (userDetails.firstName) {
        console.log("Using firstName from userDetails:", userDetails.firstName);
        return userDetails.firstName;
      }
    }
    
    // Priority 3: Extract from email if available
    if (currentUser.email) {
      const emailUsername = currentUser.email.split('@')[0];
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      console.log("Using email-based name from currentUser:", formattedName);
      return formattedName;
    }
    
    if (userDetails && userDetails.email) {
      const emailUsername = userDetails.email.split('@')[0];
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      console.log("Using email-based name from userDetails:", formattedName);
      return formattedName;
    }
    
    // Priority 4: Use userId if available as a temporary fallback
    if (currentUser.userId) {
      const fallbackName = `HR User ${currentUser.userId}`;
      console.log("Using userId-based name:", fallbackName);
      return fallbackName;
    }
    
    // Final fallback
    console.log("Using fallback: HR");
    return "HR";
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

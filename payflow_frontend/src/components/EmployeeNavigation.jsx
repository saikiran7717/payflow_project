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

const EmployeeNavigation = React.memo(() => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [employeeDetails, setEmployeeDetails] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch employee details when user object is available
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
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

      if (currentUser && !employeeDetails) {
        try {
          let response;
          const userRole = currentUser.role?.toLowerCase();
          const employeeId = currentUser.employeeId || currentUser.id;

          console.log("Fetching employee details for role:", userRole, "employeeId:", employeeId);

          // For employees, fetch from employees API
          if (employeeId) {
            console.log("Fetching employee details from /api/employees/", employeeId);
            response = await fetch(`/api/employees/${employeeId}`, {
              method: "GET",
              credentials: "include",
            });
          } else {
            // Fallback to /me endpoint
            console.log("Fetching employee details from /api/employees/me");
            response = await fetch(`/api/employees/me`, {
              method: "GET",
              credentials: "include",
            });
          }
          
          if (response && response.ok) {
            const details = await response.json();
            console.log("Successfully fetched employee details:", details);
            setEmployeeDetails(details);
          } else {
            console.log("Failed to fetch employee details. Response status:", response?.status);
            if (response) {
              const errorText = await response.text();
              console.log("Error response:", errorText);
            }
          }
        } catch (error) {
          console.error("Error fetching employee details:", error);
        }
      }
    };

    fetchEmployeeDetails();
  }, [user, employeeDetails]);

  // Helper function to get employee display name
  const getEmployeeDisplayName = () => {
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

    if (!currentUser) return "Employee";

    // Debug: Log the current user object to see what fields are available
    console.log("getEmployeeDisplayName - currentUser object:", currentUser);
    console.log("getEmployeeDisplayName - employeeDetails object:", employeeDetails);
    
    // Priority 1: Try original user object properties first (from login response)
    if (currentUser.fullName) {
      console.log("Using fullName from currentUser:", currentUser.fullName);
      return currentUser.fullName;
    }
    if (currentUser.name) {
      console.log("Using name from currentUser:", currentUser.name);
      return currentUser.name;
    }
    if (currentUser.username) {
      console.log("Using username from currentUser:", currentUser.username);
      return currentUser.username;
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
    
    // Priority 2: If we have fetched employee details from API, use them
    if (employeeDetails) {
      if (employeeDetails.fullName) {
        console.log("Using fullName from employeeDetails:", employeeDetails.fullName);
        return employeeDetails.fullName;
      }
      if (employeeDetails.name) {
        console.log("Using name from employeeDetails:", employeeDetails.name);
        return employeeDetails.name;
      }
      if (employeeDetails.username) {
        console.log("Using username from employeeDetails:", employeeDetails.username);
        return employeeDetails.username;
      }
      if (employeeDetails.firstName && employeeDetails.lastName) {
        const fullName = `${employeeDetails.firstName} ${employeeDetails.lastName}`;
        console.log("Using firstName + lastName from employeeDetails:", fullName);
        return fullName;
      }
      if (employeeDetails.firstName) {
        console.log("Using firstName from employeeDetails:", employeeDetails.firstName);
        return employeeDetails.firstName;
      }
    }
    
    // Priority 3: Extract from email if available
    if (currentUser.email) {
      const emailUsername = currentUser.email.split('@')[0];
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      console.log("Using email-based name from currentUser:", formattedName);
      return formattedName;
    }
    
    if (employeeDetails && employeeDetails.email) {
      const emailUsername = employeeDetails.email.split('@')[0];
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      console.log("Using email-based name from employeeDetails:", formattedName);
      return formattedName;
    }
    
    // Priority 4: Use employeeId if available as a temporary fallback
    if (currentUser.employeeId || currentUser.id) {
      const fallbackName = `Employee ${currentUser.employeeId || currentUser.id}`;
      console.log("Using employeeId-based name:", fallbackName);
      return fallbackName;
    }
    
    // Final fallback
    console.log("Using fallback: Employee");
    return "Employee";
  };

  // Debug logging (remove in production)
  console.log("EmployeeNavigation - Current user:", user);
  console.log("EmployeeNavigation - Employee details:", employeeDetails);
  console.log("EmployeeNavigation - Display name:", getEmployeeDisplayName());

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
          <FaHome /> Employee Dashboard
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ fontWeight: 700, color: palette.dark, fontSize: "1.1rem", letterSpacing: 0.2 }}>
          Welcome, {getEmployeeDisplayName()}
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

EmployeeNavigation.displayName = "EmployeeNavigation";

export default EmployeeNavigation;

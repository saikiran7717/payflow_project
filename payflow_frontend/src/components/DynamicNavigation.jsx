import React from "react";
import { useAuth } from "../authContext.jsx";
import HRNavigation from "./HRNavigation";
import ManagerNavigation from "./ManagerNavigation";

const DynamicNavigation = () => {
  const { user } = useAuth();
  
  // Get user from localStorage if not available from context
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

  // Determine which navigation component to render based on user role
  const userRole = currentUser?.role?.toLowerCase();
  
  if (userRole === "hr") {
    return <HRNavigation />;
  } else if (userRole === "manager") {
    return <ManagerNavigation />;
  } else {
    // For debugging - log the user role to help troubleshoot
    console.log("DynamicNavigation - User role:", currentUser?.role, "Normalized:", userRole);
    // Default fallback - could be HRNavigation or a generic navigation
    return <HRNavigation />;
  }
};

export default DynamicNavigation;

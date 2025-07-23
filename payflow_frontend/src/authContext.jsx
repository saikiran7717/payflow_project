import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("payflow_user");
    console.log("Initializing user from localStorage:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  // Login with backend
  const login = async (email, password, role) => {
    try {
      const url = role === "admin" ? "/api/admins/login" : "/api/users/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Invalid credentials" };
      }
      const userObj = await res.json();
      setUser(userObj);
      localStorage.setItem("payflow_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  // Register admin (backend)
  const registerAdmin = async (username, email, password) => {
    try {
      const res = await fetch("/api/admins/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Registration failed" };
      }
      const userObj = await res.json();
      setUser(userObj);
      localStorage.setItem("payflow_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  // Forgot password (backend)
  const forgotPassword = async (email) => {
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Failed to send reset email" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to send reset email" };
    }
  };

  // Reset password (backend)
  const resetPassword = async (email, newPassword) => {
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Failed to reset password" };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to reset password" };
    }
  };

  // Admin creates HR/Manager (backend)
  const createUser = async (username, email, password, role) => {
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Registration failed" };
      }
      const userObj = await res.json();
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  // HR/Manager change password (backend)
  const changePassword = async (userId, newPassword) => {
    try {
      const res = await fetch(`/api/users/${userId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText || "Failed to change password" };
      }
      // Optionally update user state if needed
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to change password" };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("payflow_user");
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      registerAdmin,
      forgotPassword,
      resetPassword,
      createUser,
      changePassword,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
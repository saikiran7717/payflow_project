import React, { createContext, useContext, useState } from "react";

// Mock users for demo
const mockUsers = [
  { id: 1, username: "admin", email: "admin@payflow.com", password: "admin123", role: "admin", isTempPassword: false },
  { id: 2, username: "hr1", email: "hr1@payflow.com", password: "hr123", role: "hr", isTempPassword: true },
  { id: 3, username: "manager1", email: "manager1@payflow.com", password: "manager123", role: "manager", isTempPassword: true },
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);

  // Login logic
  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: "Invalid credentials" };
  };

  // Register admin (only if no admin exists)
  const registerAdmin = (username, email, password) => {
    if (users.some(u => u.role === "admin")) {
      return { success: false, error: "Admin already exists" };
    }
    const newAdmin = { id: Date.now(), username, email, password, role: "admin", isTempPassword: false };
    setUsers([...users, newAdmin]);
    setUser(newAdmin);
    return { success: true, user: newAdmin };
  };

  // Forgot password (mock)
  const forgotPassword = (email) => {
    const found = users.find(u => u.email === email);
    if (found) {
      return { success: true };
    }
    return { success: false, error: "Email not found" };
  };

  // Reset password (mock)
  const resetPassword = (email, newPassword) => {
    setUsers(users.map(u => u.email === email ? { ...u, password: newPassword, isTempPassword: false } : u));
    return { success: true };
  };

  // Admin creates HR/Manager
  const createUser = (username, email, password, role) => {
    if (users.some(u => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }
    const newUser = { id: Date.now(), username, email, password, role, isTempPassword: true };
    setUsers([...users, newUser]);
    return { success: true, user: newUser };
  };

  // HR/Manager change password
  const changePassword = (userId, newPassword) => {
    setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword, isTempPassword: false } : u));
    setUser({ ...user, password: newPassword, isTempPassword: false });
    return { success: true };
  };

  // Logout
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, users, login, registerAdmin, forgotPassword, resetPassword, createUser, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

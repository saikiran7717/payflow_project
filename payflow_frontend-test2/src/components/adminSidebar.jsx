import React from "react";
import "../styles/sidebar.css";

export default function AdminSidebar() {
  return (
    <nav className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <ul className="space-y-2">
        <li><a href="/login" className="block hover:text-blue-300">Login</a></li>
        <li><a href="/onboard" className="block hover:text-blue-300">Onboard Employee</a></li>
        <li><a href="/reset-password" className="block hover:text-blue-300">Reset Password</a></li>
      </ul>
    </nav>
  );
}

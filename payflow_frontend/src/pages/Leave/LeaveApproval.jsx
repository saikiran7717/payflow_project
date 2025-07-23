
import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Layout.css";

export default function LeaveApproval() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
        <h2 className="text-2xl font-semibold mb-4">Leave Approval</h2>
        {/* Approve or deny leave requests */}
      </main>
    </div>
  );
}

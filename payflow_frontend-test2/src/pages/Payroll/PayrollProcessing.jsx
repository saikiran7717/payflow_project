
import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Layout.css";

export default function PayrollProcessing() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
        <h2 className="text-2xl font-semibold mb-4">Payroll Processing</h2>
        {/* Payroll actions and salary processing */}
      </main>
    </div>
  );
}


import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Layout.css";

export default function PayslipGeneration() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: "2rem", width: "100%" }}>
        <h2 className="text-2xl font-semibold mb-4">Payslip Generation</h2>
        {/* Payslip generation and download */}
      </main>
    </div>
  );
}

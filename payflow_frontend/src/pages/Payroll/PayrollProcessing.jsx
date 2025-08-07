
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DynamicNavigation from "../../components/DynamicNavigation";
import { ToastContainer, toast } from "react-toastify";
import { FaPlay, FaHistory, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaCog } from "react-icons/fa";
import { useAuth } from "../../authContext.jsx";
import "react-toastify/dist/ReactToastify.css";

export default function PayrollProcessing() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [currentMonthInfo, setCurrentMonthInfo] = useState(null);
  
  // Pagination state for payroll records
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const palette = {
    accent: "#6366f1",
    dark: "#1e293b",
    bg: "#f1f5f9",
    white: "#fff",
    green: "#22c55e",
    red: "#ef4444",
    orange: "#f97316",
    blue: "#3b82f6",
    gray: "#64748b",
    darkest: "#0f172a"
  };

  // Initialize current month when component mounts
  useEffect(() => {
    fetchCurrentMonthInfo();
    fetchEmployees();
  }, []);

  // Fetch current month info
  const fetchCurrentMonthInfo = async () => {
    try {
      const res = await fetch("/api/payroll/current-month", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMonthInfo(data);
        setSelectedMonth(data.previousMonth); // Default to previous month for processing
      }
    } catch (error) {
      console.error("Error fetching current month info:", error);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const res = await fetch("/api/employees/getAll", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.filter(emp => emp.isActive)); // Only active employees
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Generate payroll for all employees
  const handleGeneratePayrollAll = async () => {
    if (!selectedMonth) {
      toast.error("Please select a month");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/generate/all?month=${selectedMonth}`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Payroll generated for ${data.employeesProcessed} employees`);
        fetchPayrollData(selectedMonth);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to generate payroll");
      }
    } catch (error) {
      console.error("Error generating payroll:", error);
      toast.error("Network error while generating payroll");
    } finally {
      setLoading(false);
    }
  };

  // Generate payroll for specific employee
  const handleGeneratePayrollEmployee = async () => {
    if (!selectedMonth || !selectedEmployee) {
      toast.error("Please select both month and employee");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/generate/employee/${selectedEmployee}?month=${selectedMonth}`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Payroll generated successfully for employee");
        fetchPayrollData(selectedMonth);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to generate payroll for employee");
      }
    } catch (error) {
      console.error("Error generating payroll for employee:", error);
      toast.error("Network error while generating payroll");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payroll data for selected month
  const fetchPayrollData = async (month) => {
    if (!month) return;

    setLoading(true);
    try {
      const [payrollRes, summaryRes] = await Promise.all([
        fetch(`/api/payroll/month/${month}`, { credentials: "include" }),
        fetch(`/api/payroll/summary/month/${month}`, { credentials: "include" })
      ]);

      if (payrollRes.ok) {
        const payrollData = await payrollRes.json();
        setPayrollData(payrollData);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setPayrollSummary(summaryData);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payroll when month changes
  useEffect(() => {
    if (selectedMonth) {
      fetchPayrollData(selectedMonth);
      setCurrentPage(1); // Reset to first page when month changes
    }
  }, [selectedMonth]);

  // Pagination calculations
  const totalPages = Math.ceil(payrollData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentPayrollData = payrollData.slice(startIndex, endIndex);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM format
      const displayName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: yearMonth, label: displayName });
    }
    
    return options;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
    }}>
      <DynamicNavigation />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ padding: "2.5rem 3rem", width: "100%" }}>
          <div style={{
            background: palette.white,
            borderRadius: 18,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            padding: "2rem"
          }}>
            <h2 style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              marginBottom: 24,
              color: palette.darkest,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <FaMoneyBillWave style={{ color: palette.accent }} />
              Payroll Processing
            </h2>

            {/* Control Panel */}
            <div style={{
              background: `${palette.accent}11`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 32,
              border: `2px solid ${palette.accent}22`
            }}>
              <h3 style={{
                color: palette.accent,
                fontWeight: 700,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <FaCog /> Payroll Generation Controls
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 20,
                marginBottom: 24
              }}>
                {/* Month Selection */}
                <div>
                  <label style={{
                    display: "block",
                    fontWeight: 700,
                    color: palette.dark,
                    marginBottom: 8
                  }}>
                    Select Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 8,
                      border: `2px solid ${palette.gray}44`,
                      fontSize: "1rem",
                      outline: "none",
                      background: palette.white,
                      color: palette.dark
                    }}
                  >
                    <option value="">Select Month</option>
                    {generateMonthOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee Selection (Optional) */}
                <div>
                  <label style={{
                    display: "block",
                    fontWeight: 700,
                    color: palette.dark,
                    marginBottom: 8
                  }}>
                    Select Employee (Optional)
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    disabled={employeesLoading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 8,
                      border: `2px solid ${palette.gray}44`,
                      fontSize: "1rem",
                      outline: "none",
                      background: palette.white,
                      color: palette.dark
                    }}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.fullName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button
                  onClick={handleGeneratePayrollAll}
                  disabled={loading || !selectedMonth}
                  style={{
                    background: palette.accent,
                    color: palette.white,
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading || !selectedMonth ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <FaPlay />
                  {loading ? "Processing..." : "Generate for All Employees"}
                </button>

                <button
                  onClick={handleGeneratePayrollEmployee}
                  disabled={loading || !selectedMonth || !selectedEmployee}
                  style={{
                    background: palette.blue,
                    color: palette.white,
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading || !selectedMonth || !selectedEmployee ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <FaUsers />
                  Generate for Selected Employee
                </button>
              </div>
            </div>

            {/* Payroll Summary */}
            {payrollSummary && (
              <div style={{
                background: `${palette.green}11`,
                borderRadius: 12,
                padding: 24,
                marginBottom: 32,
                border: `2px solid ${palette.green}22`
              }}>
                <h3 style={{
                  color: palette.green,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <FaCalendarAlt /> Payroll Summary for {payrollSummary.month}
                </h3>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 20
                }}>
                  <div style={{
                    background: palette.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.gray}33`,
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: palette.accent, fontWeight: 700, marginBottom: 8 }}>
                      Total Employees
                    </h4>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                      {payrollSummary.totalEmployees}
                    </p>
                  </div>

                  <div style={{
                    background: palette.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.gray}33`,
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: palette.green, fontWeight: 700, marginBottom: 8 }}>
                      Total Gross Salary
                    </h4>
                    <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                      {formatCurrency(payrollSummary.totalGrossSalary)}
                    </p>
                  </div>

                  <div style={{
                    background: palette.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.gray}33`,
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: palette.red, fontWeight: 700, marginBottom: 8 }}>
                      Total Deductions
                    </h4>
                    <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                      {formatCurrency(payrollSummary.totalLeaveDeductions)}
                    </p>
                  </div>

                  <div style={{
                    background: palette.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.gray}33`,
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: palette.blue, fontWeight: 700, marginBottom: 8 }}>
                      Total Net Salary
                    </h4>
                    <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                      {formatCurrency(payrollSummary.totalNetSalary)}
                    </p>
                  </div>

                  <div style={{
                    background: palette.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${palette.gray}33`,
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: palette.orange, fontWeight: 700, marginBottom: 8 }}>
                      Total Unpaid Leaves
                    </h4>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                      {payrollSummary.totalUnpaidLeaves}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payroll Records Table */}
            {payrollData.length > 0 && (
              <div>
                <h3 style={{
                  color: palette.dark,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <FaHistory /> Payroll Records
                </h3>

                <div style={{
                  overflowX: "auto",
                  border: `1px solid ${palette.gray}33`,
                  borderRadius: 12
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: palette.white
                  }}>
                    <thead>
                      <tr style={{ background: `${palette.accent}11` }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: palette.dark }}>Employee</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: palette.dark }}>Month</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Gross Salary</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Leave Deduction</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Net Salary</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Unpaid Leaves</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Processed On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayrollData.map((payroll, index) => (
                        <tr key={payroll.id} style={{
                          borderBottom: `1px solid ${palette.gray}22`,
                          backgroundColor: index % 2 === 0 ? palette.white : `${palette.gray}05`
                        }}>
                          <td style={{ padding: "12px", color: palette.dark, fontWeight: 500 }}>
                            {payroll.employee?.fullName || payroll.employeeName || 'N/A'}
                            {payroll.employee?.employeeId && (
                              <div style={{ fontSize: "0.8rem", color: palette.gray }}>
                                ID: {payroll.employee.employeeId}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px", color: palette.dark }}>
                            {payroll.month}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: palette.dark, fontWeight: 600 }}>
                            {formatCurrency(payroll.grossSalary)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: palette.red, fontWeight: 600 }}>
                            {formatCurrency(payroll.leaveDeduction)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: palette.green, fontWeight: 700 }}>
                            {formatCurrency(payroll.netSalary)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: palette.orange, fontWeight: 600 }}>
                            {payroll.unpaidLeaves}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background: payroll.status === 'PROCESSED' ? `${palette.green}22` : `${palette.orange}22`,
                              color: payroll.status === 'PROCESSED' ? palette.green : palette.orange
                            }}>
                              {payroll.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: palette.gray, fontSize: "0.9rem" }}>
                            {formatDate(payroll.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {payrollData.length > recordsPerPage && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 20,
                    padding: "16px 0"
                  }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: `2px solid ${palette.accent}`,
                        background: currentPage === 1 ? palette.gray + "22" : palette.accent,
                        color: currentPage === 1 ? palette.gray : palette.white,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>

                    <div style={{ display: "flex", gap: 8 }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: `2px solid ${palette.accent}`,
                            background: currentPage === page ? palette.accent : palette.white,
                            color: currentPage === page ? palette.white : palette.accent,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            transition: "all 0.2s",
                            minWidth: "40px"
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: `2px solid ${palette.accent}`,
                        background: currentPage === totalPages ? palette.gray + "22" : palette.accent,
                        color: currentPage === totalPages ? palette.gray : palette.white,
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* No Data Message */}
            {selectedMonth && payrollData.length === 0 && !loading && (
              <div style={{
                textAlign: "center",
                padding: 40,
                color: palette.gray,
                background: `${palette.gray}11`,
                borderRadius: 12,
                border: `2px dashed ${palette.gray}33`
              }}>
                <FaCalendarAlt style={{ fontSize: "2rem", marginBottom: 16, opacity: 0.5 }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
                  No payroll records found for {selectedMonth}
                </p>
                <p style={{ margin: "8px 0 0 0", opacity: 0.8 }}>
                  Generate payroll using the controls above
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/DynamicNavigation.jsx";
import EmployeeSidebar from "../components/EmployeeSidebar.jsx";
import { FaDownload, FaEye, FaCalendarAlt, FaUser, FaFileInvoiceDollar } from "react-icons/fa";
import { useAuth } from "../authContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EmployeePayslips() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [payrollData, setPayrollData] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);

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

  useEffect(() => {
    // Get employee data from localStorage
    const userData = localStorage.getItem("payflow_user");
    if (userData) {
      const employeeData = JSON.parse(userData);
      setEmployee(employeeData);
    }
    
    // Set default month to previous month
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setSelectedMonth(previousMonth.toISOString().slice(0, 7));
  }, []);

  // Fetch payroll data for the logged-in employee
  const fetchPayrollData = async () => {
    if (!selectedMonth || !employee) return;

    setLoading(true);
    try {
      const employeeId = employee.employeeId || employee.id;
      const res = await fetch(`/api/payroll/employee/${employeeId}/month/${selectedMonth}`, { 
        credentials: "include" 
      });
      
      if (res.ok) {
        const data = await res.json();
        setPayrollData([data]); // Single payroll record for the employee
      } else if (res.status === 404) {
        setPayrollData([]);
        toast.warning("No payroll data found for the selected month");
      } else {
        throw new Error("Failed to fetch payroll data");
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error("Failed to fetch payroll data");
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth && employee) {
      fetchPayrollData();
    }
  }, [selectedMonth, employee]);

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
      const yearMonth = date.toISOString().slice(0, 7);
      const displayName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: yearMonth, label: displayName });
    }
    
    return options;
  };

  const handleViewPayslip = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayslip(true);
  };

  const handleDownloadPayslip = async () => {
    try {
      toast.info("Generating PDF...");
      
      // Get the payslip content element
      const element = document.getElementById('payslip-content');
      if (!element) {
        toast.error("Payslip content not found");
        return;
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calculate dimensions for PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate the actual dimensions to fit the content
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is taller than one page, we might need to handle pagination
      if (imgHeight > pdfHeight - 20) {
        // Scale down to fit in one page
        const scaleFactor = (pdfHeight - 20) / imgHeight;
        const finalWidth = imgWidth * scaleFactor;
        const finalHeight = imgHeight * scaleFactor;
        pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight);
      } else {
        // Fits in one page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      }

      // Generate filename with employee name and month
      const employeeName = (selectedPayroll?.employee?.fullName || employee?.fullName || 'Employee').replace(/[^a-zA-Z0-9]/g, '_');
      const month = selectedPayroll?.month?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
      const filename = `Payslip_${employeeName}_${month}.pdf`;

      // Save the PDF
      pdf.save(filename);
      toast.success("Payslip downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const PayslipModal = ({ payroll, onClose }) => {
    if (!payroll) return null;

    const companyInfo = {
      name: "PayFlow Technologies",
      address: "123 Hitech City",
      city: "Hyderabad, Telangana 500076",
      phone: "+91 80 1234 5678",
      email: "hr@payflow.com"
    };

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: palette.white,
          borderRadius: 12,
          padding: "2rem",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            borderBottom: `2px solid ${palette.gray}22`,
            paddingBottom: 16
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: palette.darkest,
              margin: 0
            }}>
              Payslip for {payroll.month}
            </h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleDownloadPayslip}
                style={{
                  background: palette.green,
                  color: palette.white,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <FaDownload /> Download PDF
              </button>
              <button
                onClick={onClose}
                style={{
                  background: palette.gray,
                  color: palette.white,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Payslip Content */}
          <div id="payslip-content" style={{ 
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.4"
          }}>
            {/* Company Header */}
            <div style={{
              textAlign: "center",
              marginBottom: 32,
              borderBottom: `1px solid ${palette.gray}33`,
              paddingBottom: 20
            }}>
              <h1 style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: palette.accent,
                margin: "0 0 8px 0"
              }}>
                {companyInfo.name}
              </h1>
              <p style={{ margin: 0, color: palette.gray, fontSize: "0.9rem" }}>
                {companyInfo.address}<br />
                {companyInfo.city}<br />
                Phone: {companyInfo.phone} | Email: {companyInfo.email}
              </p>
            </div>

            {/* Employee and Payroll Info */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginBottom: 32
            }}>
              <div>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: palette.darkest,
                  marginBottom: 12,
                  borderBottom: `1px solid ${palette.gray}33`,
                  paddingBottom: 8
                }}>
                  Employee Information
                </h3>
                <div style={{ fontSize: "0.9rem", color: palette.dark }}>
                  <p style={{ margin: "4px 0" }}><strong>Name:</strong> {payroll.employee?.fullName || employee?.fullName || 'N/A'}</p>
                  <p style={{ margin: "4px 0" }}><strong>Email:</strong> {payroll.employee?.email || employee?.email || 'N/A'}</p>
                  <p style={{ margin: "4px 0" }}><strong>Employee ID:</strong> {payroll.employee?.employeeId || employee?.employeeId || employee?.id || 'N/A'}</p>
                  <p style={{ margin: "4px 0" }}><strong>Department:</strong> {payroll.employee?.department || employee?.department || 'N/A'}</p>
                  <p style={{ margin: "4px 0" }}><strong>Designation:</strong> {payroll.employee?.designation || employee?.designation || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: palette.darkest,
                  marginBottom: 12,
                  borderBottom: `1px solid ${palette.gray}33`,
                  paddingBottom: 8
                }}>
                  Payroll Information
                </h3>
                <div style={{ fontSize: "0.9rem", color: palette.dark }}>
                  <p style={{ margin: "4px 0" }}><strong>Pay Period:</strong> {payroll.month}</p>
                  <p style={{ margin: "4px 0" }}><strong>Pay Date:</strong> {formatDate(payroll.createdAt)}</p>
                  <p style={{ margin: "4px 0" }}><strong>Working Days:</strong> {payroll.totalWorkingDays}</p>
                  <p style={{ margin: "4px 0" }}><strong>Unpaid Leaves:</strong> {payroll.unpaidLeaves}</p>
                  <p style={{ margin: "4px 0" }}><strong>Per Day Salary:</strong> {formatCurrency(payroll.perDaySalary)}</p>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: palette.darkest,
                marginBottom: 16,
                borderBottom: `1px solid ${palette.gray}33`,
                paddingBottom: 8
              }}>
                Salary Breakdown
              </h3>

              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem"
              }}>
                <thead>
                  <tr style={{ background: `${palette.gray}11` }}>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: palette.dark,
                      border: `1px solid ${palette.gray}33`
                    }}>
                      Description
                    </th>
                    <th style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: 700,
                      color: palette.dark,
                      border: `1px solid ${palette.gray}33`
                    }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{
                      padding: "10px 12px",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.dark
                    }}>
                      Gross Salary
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.green,
                      fontWeight: 600
                    }}>
                      {formatCurrency(payroll.grossSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{
                      padding: "10px 12px",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.dark
                    }}>
                      Leave Deduction ({payroll.unpaidLeaves} days)
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.red,
                      fontWeight: 600
                    }}>
                      -{formatCurrency(payroll.leaveDeduction)}
                    </td>
                  </tr>
                  <tr style={{ background: `${palette.green}11` }}>
                    <td style={{
                      padding: "12px",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.darkest,
                      fontWeight: 700,
                      fontSize: "1rem"
                    }}>
                      Net Salary
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      border: `1px solid ${palette.gray}33`,
                      color: palette.green,
                      fontWeight: 700,
                      fontSize: "1.1rem"
                    }}>
                      {formatCurrency(payroll.netSalary)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: "center",
              marginTop: 40,
              paddingTop: 20,
              borderTop: `1px solid ${palette.gray}33`,
              color: palette.gray,
              fontSize: "0.8rem"
            }}>
              <p style={{ margin: 0 }}>
                This is a computer-generated payslip and does not require a signature.
              </p>
              <p style={{ margin: "8px 0 0 0" }}>
                Generated on {formatDate(new Date())} by PayFlow System
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
        <EmployeeSidebar activePage="employee-payslips" />
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
              <FaFileInvoiceDollar style={{ color: palette.accent }} />
              My Payslips
            </h2>

            {/* Month Selection */}
            <div style={{
              background: `${palette.accent}11`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 32,
              border: `2px solid ${palette.accent}22`
            }}>
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
                    width: "300px",
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
            </div>

            {/* Payroll Records */}
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: palette.accent }}>
                Loading payroll data...
              </div>
            ) : payrollData.length > 0 ? (
              <div>
                <h3 style={{
                  color: palette.dark,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <FaCalendarAlt /> Your Payslip
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
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: palette.dark }}>Month</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Gross Salary</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Deductions</th>
                        <th style={{ padding: "12px", textAlign: "right", fontWeight: 700, color: palette.dark }}>Net Salary</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Unpaid Leaves</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: palette.dark }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.map((payroll, index) => (
                        <tr key={payroll.id} style={{
                          borderBottom: `1px solid ${palette.gray}22`,
                          backgroundColor: palette.white
                        }}>
                          <td style={{ padding: "12px", color: palette.dark, fontWeight: 600 }}>
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
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button
                              onClick={() => handleViewPayslip(payroll)}
                              style={{
                                background: palette.blue,
                                color: palette.white,
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "0.8rem"
                              }}
                            >
                              <FaEye /> View Payslip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedMonth ? (
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
                  No payslip found for {selectedMonth}
                </p>
                <p style={{ margin: "8px 0 0 0", opacity: 0.8 }}>
                  Your payroll may not have been processed for this month yet
                </p>
              </div>
            ) : (
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
                  Please select a month to view your payslip
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payslip Modal */}
      {showPayslip && selectedPayroll && (
        <PayslipModal
          payroll={selectedPayroll}
          onClose={() => {
            setShowPayslip(false);
            setSelectedPayroll(null);
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
}

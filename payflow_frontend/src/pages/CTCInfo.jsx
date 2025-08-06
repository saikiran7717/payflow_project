import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DynamicNavigation from "../components/DynamicNavigation";
import { useAuth } from "../authContext.jsx";
import { FaDollarSign, FaSearch, FaEdit, FaSave, FaTimes, FaMoneyBillWave, FaPiggyBank, FaChartLine, FaInfoCircle, FaHistory, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const palette = {
  blue: "#2563eb",
  teal: "#06b6d4",
  yellow: "#facc15",
  orange: "#fb923c",
  red: "#ef4444",
  green: "#22c55e",
  purple: "#a21caf",
  gray: "#64748b",
  dark: "#1e293b",
  light: "#f8fafc",
  accent: "#6366f1",
  bg: "#f1f5f9",
  white: "#fff",
};

export default function CTCInfo() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [ctcData, setCTCData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ctcHistory, setCTCHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [showCTCDetails, setShowCTCDetails] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    basicSalary: "",
    allowances: "",
    bonuses: "",
    pfContribution: "",
    gratuity: "",
    totalCtc: "",
    netMonthlySalary: "",
    effectiveFrom: "",
  });

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSearch = async () => {
    if (!employeeId.trim()) {
      toast.error("Please enter an Employee ID", { position: "top-center" });
      return;
    }

    setLoading(true);
    setError(null);
    setCTCData(null);
    setEmployeeData(null);
    setIsEditing(false);
    setShowHistory(false);
    setShowCTCDetails(false);

    try {
      console.log("Searching for employee:", employeeId);

      // First, fetch employee details
      const employeeResponse = await fetch(`/api/employees/${employeeId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!employeeResponse.ok) {
        if (employeeResponse.status === 404) {
          setError("Employee not found. Please check the Employee ID.");
          toast.error("Employee not found", { position: "top-center" });
        } else {
          setError("Failed to fetch employee details");
          toast.error("Failed to fetch employee details", { position: "top-center" });
        }
        setLoading(false);
        return;
      }

      const employee = await employeeResponse.json();
      console.log("Employee found:", employee);
      setEmployeeData(employee);

      // Then, fetch CTC details
      const ctcResponse = await fetch(`/api/ctc/employee/${employeeId}/latest`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("CTC API response status:", ctcResponse.status);

      if (ctcResponse.ok) {
        const ctc = await ctcResponse.json();
        console.log("CTC data received:", ctc);
        setCTCData(ctc);
        
        // Initialize edit form with current data
        setEditForm({
          basicSalary: ctc.basicSalary || "",
          allowances: ctc.allowances || "",
          bonuses: ctc.bonuses || "",
          pfContribution: ctc.pfContribution || "",
          gratuity: ctc.gratuity || "",
          totalCtc: ctc.totalCtc || "",
          netMonthlySalary: ctc.netMonthlySalary || "",
          effectiveFrom: ctc.effectiveFrom ? ctc.effectiveFrom.split('T')[0] : "",
        });
      } else if (ctcResponse.status === 404) {
        setCTCData(null);
        // Initialize empty edit form for new CTC
        setEditForm({
          basicSalary: "",
          allowances: "",
          bonuses: "",
          pfContribution: "",
          gratuity: "",
          totalCtc: "",
          netMonthlySalary: "",
          effectiveFrom: new Date().toISOString().split('T')[0],
        });
      } else {
        setError("Failed to fetch CTC details");
        toast.error("Failed to fetch CTC details", { position: "top-center" });
        setLoading(false);
        return;
      }

      // Show CTC details page after successful search
      setShowCTCDetails(true);

    } catch (err) {
      console.error("Error during search:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditForm = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalCTC = () => {
    const basic = parseFloat(editForm.basicSalary) || 0;
    const allowances = parseFloat(editForm.allowances) || 0;
    const bonuses = parseFloat(editForm.bonuses) || 0;
    const pf = parseFloat(editForm.pfContribution) || 0;
    const gratuity = parseFloat(editForm.gratuity) || 0;
    
    const total = basic + allowances + bonuses + pf + gratuity;
    setEditForm(prev => ({ ...prev, totalCtc: total.toString() }));
    
    // Also calculate net monthly salary (roughly total - pf - gratuity / 12)
    const netMonthly = (basic + allowances + bonuses - pf - gratuity) / 12;
    setEditForm(prev => ({ ...prev, netMonthlySalary: Math.max(0, netMonthly).toString() }));
  };

  const handleSaveCTC = async () => {
    if (!employeeData) {
      toast.error("Please search for an employee first", { position: "top-center" });
      return;
    }

    // Validate required fields
    if (!editForm.basicSalary || !editForm.totalCtc || !editForm.effectiveFrom) {
      toast.error("Please fill in all required fields (Basic Salary, Total CTC, Effective From)", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      
      const ctcPayload = {
        basicSalary: parseFloat(editForm.basicSalary) || 0,
        allowances: parseFloat(editForm.allowances) || 0,
        bonuses: parseFloat(editForm.bonuses) || 0,
        pfContribution: parseFloat(editForm.pfContribution) || 0,
        gratuity: parseFloat(editForm.gratuity) || 0,
        totalCtc: parseFloat(editForm.totalCtc) || 0,
        netMonthlySalary: parseFloat(editForm.netMonthlySalary) || 0,
        effectiveFrom: editForm.effectiveFrom,
      };

      console.log("Saving CTC data:", ctcPayload);

      const method = ctcData ? "PUT" : "POST";
      const url = ctcData 
        ? `/api/ctc/${ctcData.ctcId}` 
        : `/api/ctc/employee/${employeeData.employeeId || employeeData.id}`;

      const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ctcPayload),
      });

      if (response.ok) {
        const savedCTC = await response.json();
        console.log("CTC saved successfully:", savedCTC);
        setCTCData(savedCTC);
        setIsEditing(false);
        toast.success(`CTC ${ctcData ? 'updated' : 'created'} successfully!`, { position: "top-center" });
      } else {
        let errorMessage = "Failed to save CTC details";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
          }
        }
        console.error("Failed to save CTC:", response.status, errorMessage);
        toast.error(errorMessage, { position: "top-center" });
      }
    } catch (err) {
      console.error("Error saving CTC:", err);
      toast.error("Network error while saving CTC", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowCTCDetails(false);
    setEmployeeData(null);
    setCTCData(null);
    setIsEditing(false);
    setShowHistory(false);
    setEmployeeId("");
    setError(null);
  };

  const fetchCTCHistory = async () => {
    if (!employeeData) {
      console.error("No employee data available for fetching CTC history");
      return;
    }
    
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const employeeId = employeeData.employeeId || employeeData.id;
      console.log("Fetching CTC history for employee ID:", employeeId);
      
      // Try multiple possible endpoints
      const endpoints = [
        `/api/ctc/employee/${employeeId}/history`,
        `/api/ctc/history/${employeeId}`,
        `/api/ctc/${employeeId}/history`,
        `/api/employees/${employeeId}/ctc/history`
      ];
      
      let response = null;
      let endpoint = null;
      
      for (const ep of endpoints) {
        console.log("Trying endpoint:", ep);
        try {
          response = await fetch(ep, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (response.ok) {
            endpoint = ep;
            break;
          } else {
            console.log(`Endpoint ${ep} failed with status:`, response.status);
          }
        } catch (err) {
          console.log(`Endpoint ${ep} failed with error:`, err.message);
        }
      }

      if (response && response.ok) {
        console.log("Successfully fetched from endpoint:", endpoint);
        const history = await response.json();
        console.log("CTC history received:", history);
        console.log("Is history an array?", Array.isArray(history));
        console.log("History length:", history?.length);
        
        if (Array.isArray(history)) {
          setCTCHistory(history);
        } else if (history && typeof history === 'object' && history.data) {
          setCTCHistory(Array.isArray(history.data) ? history.data : []);
        } else {
          setCTCHistory([]);
        }
      } else {
        const errorText = response ? await response.text() : "All endpoints failed";
        console.error("Failed to fetch CTC history from all endpoints:", errorText);
        setHistoryError(`Failed to fetch CTC history. Please check if the endpoint exists.`);
        setCTCHistory([]);
      }
    } catch (err) {
      console.error("Error fetching CTC history:", err);
      setHistoryError(`Network error: ${err.message}`);
      setCTCHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    setHistoryError(null);
    fetchCTCHistory();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: `linear-gradient(120deg, ${palette.bg} 60%, #e0f2fe 100%)`,
      }}
    >
      <DynamicNavigation />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main style={{ padding: "2.5rem 2rem", width: "100%" }}>
          {!showCTCDetails ? (
            /* Search Page */
            <div
              style={{
                background: palette.white,
                borderRadius: 20,
                boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
                padding: 36,
                border: `1.5px solid ${palette.accent}22`,
              }}
            >
              <h2
                style={{
                  fontWeight: 800,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: palette.accent,
                  fontSize: "1.5rem",
                  letterSpacing: 0.2,
                }}
              >
                <FaDollarSign /> CTC Information Management
              </h2>

              {/* Search Section */}
              <div
                style={{
                  background: `${palette.accent}11`,
                  borderRadius: 16,
                  padding: 24,
                  border: `2px solid ${palette.accent}33`,
                  marginBottom: 32,
                }}
              >
                <h3 style={{ 
                  color: palette.accent, 
                  fontWeight: 700, 
                  marginBottom: 16,
                  fontSize: "1.2rem"
                }}>
                  Search Employee CTC
                </h3>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Enter Employee ID (e.g., EMP001)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: `2px solid ${palette.accent}44`,
                      fontSize: "1rem",
                      outline: "none",
                      transition: "all 0.2s",
                      background: palette.white,
                      color: palette.dark,
                      fontWeight: 500,
                      boxShadow: "0 2px 4px rgba(99, 102, 241, 0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = palette.accent;
                      e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${palette.accent}44`;
                      e.target.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.1)";
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                      background: palette.accent,
                      color: palette.white,
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <FaSearch /> {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div style={{
                  background: `${palette.red}11`,
                  color: palette.red,
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: `2px solid ${palette.red}33`,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <FaInfoCircle />
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading && !error && (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "4px solid rgba(99, 102, 241, 0.3)",
                      borderTop: "4px solid #6366f1",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ color: palette.accent, fontWeight: 600, fontSize: "1.1rem" }}>
                    Loading employee and CTC details...
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* CTC Details Page */
            <div
              style={{
                background: palette.white,
                borderRadius: 20,
                boxShadow: "0 6px 24px 0 rgba(36,37,38,0.09)",
                padding: 36,
                border: `1.5px solid ${palette.accent}22`,
              }}
            >
              {/* Header with Back Button and Edit Button */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}>
                <button
                  onClick={handleBackToSearch}
                  style={{
                    background: palette.gray,
                    color: palette.white,
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#475569";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = palette.gray;
                  }}
                >
                  <FaArrowLeft /> Back to Search
                </button>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: ctcData ? palette.orange : palette.green,
                      color: palette.white,
                      border: "none",
                      borderRadius: 8,
                      padding: "12px 24px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                  >
                    <FaEdit /> {ctcData ? "Edit CTC" : "Create CTC"}
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleSaveCTC}
                      style={{
                        background: palette.green,
                        color: palette.white,
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 24px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FaSave /> Save CTC
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        background: palette.gray,
                        color: palette.white,
                        border: "none",
                        borderRadius: 8,
                        padding: "12px 24px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Employee Info Header */}
              {employeeData && (
                <div style={{
                  background: `${palette.green}11`,
                  borderRadius: 16,
                  padding: 20,
                  border: `2px solid ${palette.green}33`,
                  marginBottom: 24,
                }}>
                  <h3 style={{ color: palette.green, fontWeight: 700, marginBottom: 12 }}>
                    Employee Information
                  </h3>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(2, 1fr)", 
                    gap: "12px 32px",
                    alignItems: "start"
                  }}>
                    <div>
                      <strong style={{ color: palette.green }}>ID:</strong>
                      <p style={{ margin: "4px 0 0 0", color: palette.dark, fontWeight: 600 }}>
                        {employeeData.employeeId || employeeData.id}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: palette.green }}>Name:</strong>
                      <p style={{ margin: "4px 0 0 0", color: palette.dark, fontWeight: 600 }}>
                        {employeeData.name || employeeData.fullName}
                      </p>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <strong style={{ color: palette.green }}>Email:</strong>
                      <p style={{ margin: "4px 0 0 0", color: palette.dark, fontWeight: 600 }}>
                        {employeeData.email}
                      </p>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <strong style={{ color: palette.green }}>Designation:</strong>
                      <p style={{ margin: "4px 0 0 0", color: palette.dark, fontWeight: 600 }}>
                        {employeeData.designation || employeeData.position}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTC Display/Edit Form */}
              {!ctcData && !isEditing ? (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: `${palette.orange}11`,
                  borderRadius: 16,
                  border: `2px solid ${palette.orange}33`,
                  marginBottom: 24,
                }}>
                  <FaInfoCircle style={{ fontSize: "3rem", color: palette.orange, marginBottom: 16 }} />
                  <h3 style={{ color: palette.orange, fontWeight: 700, marginBottom: 12 }}>
                    No CTC Record Found
                  </h3>
                  <p style={{ color: palette.gray, marginBottom: 20 }}>
                    This employee doesn't have any CTC information yet.
                  </p>
                </div>
              ) : isEditing ? (
                /* Edit Form */
                <div style={{
                  background: `${palette.bg}`,
                  borderRadius: 16,
                  padding: 28,
                  border: `2px solid ${palette.accent}22`,
                  marginBottom: 24,
                }}>
                  <h3 style={{ color: palette.accent, fontWeight: 700, marginBottom: 20 }}>
                    {ctcData ? "Edit CTC Details" : "Create New CTC"}
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        Basic Salary (Annual) *
                      </label>
                      <input
                        type="number"
                        value={editForm.basicSalary}
                        onChange={(e) => handleEditForm("basicSalary", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                          calculateTotalCTC();
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        Allowances (Annual)
                      </label>
                      <input
                        type="number"
                        value={editForm.allowances}
                        onChange={(e) => handleEditForm("allowances", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                          calculateTotalCTC();
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        Annual Bonus
                      </label>
                      <input
                        type="number"
                        value={editForm.bonuses}
                        onChange={(e) => handleEditForm("bonuses", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                          calculateTotalCTC();
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        PF Contribution (Annual)
                      </label>
                      <input
                        type="number"
                        value={editForm.pfContribution}
                        onChange={(e) => handleEditForm("pfContribution", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                          calculateTotalCTC();
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        Gratuity (Annual)
                      </label>
                      <input
                        type="number"
                        value={editForm.gratuity}
                        onChange={(e) => handleEditForm("gratuity", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                          calculateTotalCTC();
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: palette.dark, marginBottom: 8 }}>
                        Effective From *
                      </label>
                      <input
                        type="date"
                        value={editForm.effectiveFrom}
                        onChange={(e) => handleEditForm("effectiveFrom", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 8,
                          border: `2px solid ${palette.gray}44`,
                          fontSize: "1rem",
                          outline: "none",
                          background: palette.white,
                          color: palette.dark,
                          fontWeight: 500,
                          transition: "all 0.2s",
                          boxShadow: "0 2px 4px rgba(100, 116, 139, 0.1)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = palette.accent;
                          e.target.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${palette.gray}44`;
                          e.target.style.boxShadow = "0 2px 4px rgba(100, 116, 139, 0.1)";
                        }}
                      />
                    </div>
                  </div>

                  {/* Calculated fields */}
                  <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                    <div style={{
                      background: `${palette.accent}11`,
                      padding: 16,
                      borderRadius: 12,
                      border: `2px solid ${palette.accent}33`,
                    }}>
                      <strong style={{ color: palette.accent }}>Total CTC (Annual):</strong>
                      <p style={{ margin: "8px 0 0 0", fontSize: "1.2rem", fontWeight: 700, color: palette.dark }}>
                        {formatCurrency(editForm.totalCtc)}
                      </p>
                    </div>
                    
                    <div style={{
                      background: `${palette.green}11`,
                      padding: 16,
                      borderRadius: 12,
                      border: `2px solid ${palette.green}33`,
                    }}>
                      <strong style={{ color: palette.green }}>Net Monthly Salary:</strong>
                      <p style={{ margin: "8px 0 0 0", fontSize: "1.2rem", fontWeight: 700, color: palette.dark }}>
                        {formatCurrency(editForm.netMonthlySalary)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : ctcData && (
                /* Display CTC */
                <div style={{ marginBottom: 24 }}>
                  {/* CTC Overview Cards */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: 20, 
                    marginBottom: 32 
                  }}>
                    <div style={{
                      background: `linear-gradient(135deg, ${palette.accent}15 0%, ${palette.accent}05 100%)`,
                      borderRadius: 16,
                      padding: 20,
                      border: `2px solid ${palette.accent}33`,
                      textAlign: "center"
                    }}>
                      <FaMoneyBillWave style={{ fontSize: "2rem", color: palette.accent, marginBottom: 8 }} />
                      <h3 style={{ color: palette.accent, fontWeight: 700, margin: "8px 0 4px 0" }}>
                        Annual CTC
                      </h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.dark, margin: 0 }}>
                        {formatCurrency(ctcData.totalCtc || 0)}
                      </p>
                    </div>

                    <div style={{
                      background: `linear-gradient(135deg, ${palette.green}15 0%, ${palette.green}05 100%)`,
                      borderRadius: 16,
                      padding: 20,
                      border: `2px solid ${palette.green}33`,
                      textAlign: "center"
                    }}>
                      <FaPiggyBank style={{ fontSize: "2rem", color: palette.green, marginBottom: 8 }} />
                      <h3 style={{ color: palette.green, fontWeight: 700, margin: "8px 0 4px 0" }}>
                        Monthly Gross
                      </h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.dark, margin: 0 }}>
                        {formatCurrency((ctcData.totalCtc / 12) || 0)}
                      </p>
                    </div>

                    <div style={{
                      background: `linear-gradient(135deg, ${palette.blue}15 0%, ${palette.blue}05 100%)`,
                      borderRadius: 16,
                      padding: 20,
                      border: `2px solid ${palette.blue}33`,
                      textAlign: "center"
                    }}>
                      <FaChartLine style={{ fontSize: "2rem", color: palette.blue, marginBottom: 8 }} />
                      <h3 style={{ color: palette.blue, fontWeight: 700, margin: "8px 0 4px 0" }}>
                        Net Monthly Salary
                      </h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, color: palette.dark, margin: 0 }}>
                        {formatCurrency(ctcData.netMonthlySalary || 0)}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                        {ctcData.effectiveFrom && `Effective: ${new Date(ctcData.effectiveFrom).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Detailed CTC Breakdown */}
                  <div style={{
                    background: `linear-gradient(120deg, ${palette.bg} 80%, #e0e7ef 100%)`,
                    borderRadius: 16,
                    padding: 28,
                    border: `2px solid ${palette.accent}22`,
                  }}>
                    <h3 style={{ 
                      color: palette.accent, 
                      fontWeight: 700, 
                      marginBottom: 20,
                      fontSize: "1.3rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}>
                      <FaChartLine /> CTC Breakdown
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                      <div style={{
                        background: palette.white,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${palette.gray}33`,
                      }}>
                        <h4 style={{ color: palette.accent, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                          Basic Salary
                        </h4>
                        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                          {formatCurrency(ctcData.basicSalary || 0)}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                          Monthly: {formatCurrency((ctcData.basicSalary / 12) || 0)}
                        </p>
                      </div>

                      <div style={{
                        background: palette.white,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${palette.gray}33`,
                      }}>
                        <h4 style={{ color: palette.blue, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                          Allowances
                        </h4>
                        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                          {formatCurrency(ctcData.allowances || 0)}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: palette.gray, margin: "4px 0 0 0" }}>
                          Monthly: {formatCurrency((ctcData.allowances / 12) || 0)}
                        </p>
                      </div>

                      <div style={{
                        background: palette.white,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${palette.gray}33`,
                      }}>
                        <h4 style={{ color: palette.orange, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                          Annual Bonus
                        </h4>
                        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                          {formatCurrency(ctcData.bonuses || 0)}
                        </p>
                      </div>

                      <div style={{
                        background: palette.white,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${palette.gray}33`,
                      }}>
                        <h4 style={{ color: palette.purple, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                          PF Contribution
                        </h4>
                        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                          {formatCurrency(ctcData.pfContribution || 0)}
                        </p>
                      </div>

                      <div style={{
                        background: palette.white,
                        borderRadius: 12,
                        padding: 16,
                        border: `1px solid ${palette.gray}33`,
                      }}>
                        <h4 style={{ color: palette.yellow, fontWeight: 900, marginBottom: 8, fontSize: "1.1rem" }}>
                          Gratuity
                        </h4>
                        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: palette.dark, margin: 0 }}>
                          {formatCurrency(ctcData.gratuity || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTC History Button at Bottom */}
              {ctcData && !isEditing && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <button
                    onClick={handleShowHistory}
                    style={{
                      background: palette.blue,
                      color: palette.white,
                      border: "none",
                      borderRadius: 8,
                      padding: "16px 32px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      margin: "0 auto",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#1d4ed8";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(37, 99, 235, 0.6)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = palette.blue;
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                    }}
                  >
                    <FaHistory /> View CTC History
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CTC History Modal */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(30,41,59,0.18)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            style={{
              background: palette.white,
              borderRadius: 18,
              boxShadow: "0 8px 32px 0 rgba(36,37,38,0.18)",
              padding: 36,
              minWidth: 600,
              maxWidth: 900,
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHistory(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: palette.red,
                color: palette.white,
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ×
            </button>
            
            <h3 style={{ 
              fontWeight: 800, 
              color: palette.accent, 
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <FaHistory /> CTC History - {employeeData?.name || employeeData?.fullName}
            </h3>
            
            {historyLoading ? (
              <p style={{ color: palette.accent, textAlign: "center", padding: "2rem" }}>
                Loading history...
              </p>
            ) : historyError ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.red, marginBottom: "1rem", fontWeight: 600 }}>
                  Error loading CTC history
                </p>
                <p style={{ color: palette.gray, fontSize: "0.9rem" }}>
                  {historyError}
                </p>
                <button
                  onClick={fetchCTCHistory}
                  style={{
                    marginTop: "1rem",
                    background: palette.accent,
                    color: palette.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Retry
                </button>
              </div>
            ) : ctcHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.gray, marginBottom: "1rem" }}>
                  No CTC history found.
                </p>
                <p style={{ color: palette.gray, fontSize: "0.9rem" }}>
                  Employee ID: {employeeData?.employeeId || employeeData?.id}
                </p>
                <p style={{ color: palette.gray, fontSize: "0.9rem" }}>
                  History records: {ctcHistory?.length || 0}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: palette.bg }}>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, color: palette.accent }}>Date</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, color: palette.accent }}>Action</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, color: palette.accent }}>Total CTC</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, color: palette.accent }}>Basic Salary</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 700, color: palette.accent }}>Effective From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctcHistory.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${palette.gray}33` }}>
                        <td style={{ padding: 12, color: palette.dark }}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 12, color: palette.dark }}>{record.action || "Updated"}</td>
                        <td style={{ padding: 12, color: palette.dark, fontWeight: 600 }}>
                          {formatCurrency(record.totalCtc)}
                        </td>
                        <td style={{ padding: 12, color: palette.dark }}>
                          {formatCurrency(record.basicSalary)}
                        </td>
                        <td style={{ padding: 12, color: palette.dark }}>
                          {record.effectiveFrom ? new Date(record.effectiveFrom).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

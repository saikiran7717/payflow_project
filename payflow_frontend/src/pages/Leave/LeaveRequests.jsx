
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DynamicNavigation from "../../components/DynamicNavigation";
import { useAuth } from "../../authContext.jsx";
import { FaCalendarAlt, FaHome, FaUser, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Layout.css";

const palette = {
  blue: "#93c5fd",      // subtle blue (same as admin)
  teal: "#99f6e4",      // subtle teal (same as admin)
  yellow: "#fde68a",    // subtle yellow (same as admin)
  orange: "#fdba74",    // subtle orange (same as admin)
  red: "#ef4444",       // bright red (same as admin)
  green: "#22c55e",     // bright green (same as admin)
  purple: "#ddd6fe",    // subtle purple (same as admin)
  gray: "#9ca3af",      // darker gray for better visibility
  dark: "#374151",      // darker text for better readability
  darkest: "#1f2937",   // darkest text for high contrast
  light: "#f8fafc",     // same as admin
  accent: "#6366f1",    // same as admin
  bg: "#f1f5f9",        // same as admin
  white: "#fff",        // same as admin
};

export default function LeaveRequests() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  
  // Filter state
  const [filter, setFilter] = useState("ALL");
  
  // Modal states for leave details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

    // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      // Get user data
      const userData = localStorage.getItem("payflow_user");
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) {
        setError("Please login to view leave requests");
        toast.error("Please login first", { position: "top-center" });
        setTimeout(() => window.location.href = "/login", 2000);
        return;
      }
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header if user token exists
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
      
      let response;
      try {
        // Try primary API endpoint
        response = await fetch("/api/leaves/all", {
          method: "GET",
          credentials: "include",
          headers,
        });
        
        // If 401/403, try with session authentication only
        if (response.status === 401 || response.status === 403) {
          response = await fetch("/api/leaves/all", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      } catch (err) {
        console.log("Primary API failed, using mock data for development...", err);
        
        // Fallback to mock data for development/testing
        const mockLeaveRequests = [
          {
            id: 1,
            employeeId: "EMP001",
            employeeName: "John Doe",
            startDate: "2025-08-05",
            endDate: "2025-08-07",
            reason: "Family vacation",
            status: "pending",
            createdAt: "2025-07-27T10:00:00Z"
          },
          {
            id: 2,
            employee_id: "EMP002",
            employeeName: "Jane Smith", 
            startDate: "2025-08-10",
            endDate: "2025-08-12",
            reason: "Medical appointment",
            status: "pending",
            createdAt: "2025-07-28T11:00:00Z"
          },
          {
            id: 3,
            employee: { id: "EMP003" },
            employeeName: "Mike Johnson",
            startDate: "2025-07-25",
            endDate: "2025-07-26",
            reason: "Personal emergency",
            status: "approved",
            createdAt: "2025-07-25T09:00:00Z"
          },
          {
            id: 4,
            empId: "EMP004",
            employeeName: "Sarah Wilson",
            startDate: "2025-08-01",
            endDate: "2025-08-03",
            reason: "Wedding ceremony",
            status: "rejected",
            createdAt: "2025-07-26T14:00:00Z"
          }
        ];
        
        setTimeout(() => {
          setLeaveRequests(mockLeaveRequests);
          setError(null);
          setLoading(false);
          setCurrentPage(1); // Reset to first page
        }, 1000);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(Array.isArray(data) ? data : []);
        setError(null);
        setCurrentPage(1); // Reset to first page when data changes
        // Don't reset filter here - let user maintain their filter choice
      } else if (response.status === 401) {
        setError("Session expired. Please login again.");
        toast.error("Session expired. Please login again.", { position: "top-center" });
        setTimeout(() => {
          localStorage.removeItem("payflow_user");
          window.location.href = "/login";
        }, 2000);
      } else if (response.status === 403) {
        setError("Access denied. You don't have permission to view leave requests.");
        toast.error("Access denied", { position: "top-center" });
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        setError("Failed to fetch leave requests");
        toast.error("Failed to fetch leave requests", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error loading leave requests", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Handle approve/reject leave request
  const handleLeaveAction = async (leaveId, action) => {
    setProcessingIds(prev => new Set([...prev, leaveId]));
    
    try {
      const status = action === "approve" ? "APPROVED" : "REJECTED";
      const response = await fetch(`/api/leaves/${leaveId}/status?status=${status}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success(`Leave request ${action}d successfully!`, { position: "top-center" });
        // Refresh the list and maintain current page if possible
        await fetchLeaveRequests();
      } else {
        const errorText = await response.text();
        toast.error(errorText || `Failed to ${action} leave request`, { position: "top-center" });
      }
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      toast.error(`Error ${action}ing leave request`, { position: "top-center" });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return palette.green;
      case 'REJECTED':
        return palette.red;
      case 'PENDING':
        return palette.orange;
      default:
        return palette.gray;
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span
        style={{
          background: color,
          color: palette.white,
          padding: "4px 12px",
          borderRadius: 12,
          fontSize: "0.85rem",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {status || "PENDING"}
      </span>
    );
  };

  const calculateLeaveDays = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  // Handle leave details modal
  const handleShowLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLeave(null);
  };

  // Sort leave requests to show pending first, then by date
  const sortedLeaveRequests = leaveRequests.sort((a, b) => {
    // First, sort by status (pending first)
    if (a.status?.toUpperCase() === 'PENDING' && b.status?.toUpperCase() !== 'PENDING') {
      return -1;
    }
    if (a.status?.toUpperCase() !== 'PENDING' && b.status?.toUpperCase() === 'PENDING') {
      return 1;
    }
    
    // Then sort by created date (newest first)
    const dateA = new Date(a.createdAt || a.appliedDate || 0);
    const dateB = new Date(b.createdAt || b.appliedDate || 0);
    return dateB - dateA;
  });

  // Filter leave requests based on selected filter
  const filteredLeaveRequests = sortedLeaveRequests.filter(request => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return request.status?.toUpperCase() === "PENDING";
    if (filter === "APPROVED") return request.status?.toUpperCase() === "APPROVED";
    if (filter === "REJECTED") return request.status?.toUpperCase() === "REJECTED";
    return true;
  });

  // Calculate pagination based on filtered results
  const totalPages = Math.ceil(filteredLeaveRequests.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRequests = filteredLeaveRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // Helper function to get employee ID from various possible properties
  const getEmployeeId = (request) => {
    return request.employeeId || 
           request.employee_id || 
           request.employee?.id || 
           request.employee?.employeeId ||
           request.empId ||
           "N/A";
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
              <FaCalendarAlt /> All Leave Requests
              {filter !== "ALL" && (
                <span style={{ 
                  color: palette.orange, 
                  fontSize: "1.2rem", 
                  fontWeight: 600,
                  marginLeft: 8
                }}>
                  - {filter.charAt(0) + filter.slice(1).toLowerCase()} Only
                </span>
              )}
            </h2>

            {/* Filter Buttons */}
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, color: palette.accent, fontSize: "1.1rem" }}>
                Filter by Status:
              </span>
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => handleFilterChange(filterOption)}
                  style={{
                    background: filter === filterOption ? palette.accent : palette.white,
                    color: filter === filterOption ? palette.white : palette.accent,
                    border: `2px solid ${palette.accent}`,
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.2s",
                    boxShadow: filter === filterOption ? 
                      "0 4px 12px rgba(99, 102, 241, 0.4)" : 
                      "0 2px 6px rgba(99, 102, 241, 0.2)",
                  }}
                  onMouseOver={(e) => {
                    if (filter !== filterOption) {
                      e.target.style.background = `${palette.accent}11`;
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (filter !== filterOption) {
                      e.target.style.background = palette.white;
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {filterOption === "ALL" ? "All" : 
                   filterOption === "PENDING" ? "Pending" :
                   filterOption === "APPROVED" ? "Approved" : "Rejected"}
                  {filterOption !== "ALL" && (
                    <span style={{ 
                      marginLeft: 6, 
                      background: filter === filterOption ? 
                        "rgba(255,255,255,0.2)" : 
                        `${palette.accent}22`,
                      borderRadius: 12,
                      padding: "2px 6px",
                      fontSize: "0.8rem"
                    }}>
                      {filterOption === "PENDING" ? 
                        leaveRequests.filter(r => r.status?.toUpperCase() === "PENDING").length :
                       filterOption === "APPROVED" ?
                        leaveRequests.filter(r => r.status?.toUpperCase() === "APPROVED").length :
                        leaveRequests.filter(r => r.status?.toUpperCase() === "REJECTED").length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <FaSpinner 
                  style={{ 
                    fontSize: "2rem", 
                    color: palette.accent, 
                    animation: "spin 1s linear infinite" 
                  }} 
                />
                <p style={{ color: palette.accent, fontWeight: 600, marginTop: 16 }}>
                  Loading leave requests...
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.red, fontWeight: 600, fontSize: "1.1rem" }}>{error}</p>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.gray, fontWeight: 600, fontSize: "1.1rem" }}>
                  No leave requests found.
                </p>
              </div>
            ) : filteredLeaveRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: palette.gray, fontWeight: 600, fontSize: "1.1rem" }}>
                  No {filter.toLowerCase()} leave requests found.
                </p>
                <button
                  onClick={() => handleFilterChange("ALL")}
                  style={{
                    marginTop: 12,
                    background: palette.accent,
                    color: palette.white,
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Show All Requests
                </button>
              </div>
            ) : (
              <>
                <div style={{ width: "100%" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      fontSize: "1rem",
                      color: palette.darkest,
                      background: "transparent",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px #6366f111",
                      border: `2px solid ${palette.accent}22`,
                    }}
                  >
                    <thead
                      style={{
                        background: `${palette.accent}11`,
                        borderBottom: `2.5px solid ${palette.accent}`,
                        textAlign: "left",
                      }}
                    >
                      <tr>
                        <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Employee ID</th>
                        <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Name</th>
                        <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Days</th>
                        <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Status</th>
                        <th style={{ padding: 14, fontWeight: 800, color: palette.accent }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRequests.map((request, idx) => (
                        <tr
                          key={request.id}
                          style={{
                            borderBottom: "1.5px solid #64748b33",
                            background: idx % 2 === 0 ? palette.white : palette.light,
                            transition: "background 0.2s",
                          }}
                        >
                          <td style={{ padding: 14, fontWeight: 600 }}>
                            {getEmployeeId(request)}
                          </td>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {request.employeeName || request.employee?.name || request.employee?.fullName || "N/A"}
                        </td>
                        <td style={{ padding: 14, fontWeight: 600 }}>
                          {calculateLeaveDays(request.startDate, request.endDate)} days
                        </td>
                        <td style={{ padding: 14 }}>
                          {getStatusBadge(request.status)}
                        </td>
                        <td style={{ padding: 14 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {request.status?.toUpperCase() === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleLeaveAction(request.id, "approve")}
                                  disabled={processingIds.has(request.id)}
                                  style={{
                                    background: palette.green,
                                    color: palette.white,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "6px 12px",
                                    fontWeight: 700,
                                    cursor: processingIds.has(request.id) ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    transition: "background 0.2s",
                                    opacity: processingIds.has(request.id) ? 0.6 : 1,
                                  }}
                                >
                                  {processingIds.has(request.id) ? (
                                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(request.id, "reject")}
                                  disabled={processingIds.has(request.id)}
                                  style={{
                                    background: palette.red,
                                    color: palette.white,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "6px 12px",
                                    fontWeight: 700,
                                    cursor: processingIds.has(request.id) ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    transition: "background 0.2s",
                                    opacity: processingIds.has(request.id) ? 0.6 : 1,
                                  }}
                                >
                                  {processingIds.has(request.id) ? (
                                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                                  ) : (
                                    <FaTimesCircle />
                                  )}
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleShowLeaveDetails(request)}
                              style={{
                                background: palette.accent,
                                color: palette.white,
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                transition: "background 0.2s",
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <button
                  onClick={() => setCurrentPage(prev => prev > 1 ? prev - 1 : 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: `1.5px solid ${palette.accent}`,
                    background: currentPage === 1 ? palette.bg : palette.accent,
                    color: currentPage === 1 ? palette.accent : palette.white,
                    cursor: currentPage === 1 ? "default" : "pointer",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    transition: "background 0.2s",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontWeight: 700, color: palette.accent, fontSize: "1.08rem" }}>
                  Page {currentPage} of {totalPages}
                  {filteredLeaveRequests.length !== leaveRequests.length && (
                    <span style={{ color: palette.gray, fontSize: "0.9rem", fontWeight: 500 }}>
                      {" "}({filteredLeaveRequests.length} filtered)
                    </span>
                  )}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: `1.5px solid ${palette.accent}`,
                    background: currentPage === totalPages ? palette.bg : palette.accent,
                    color: currentPage === totalPages ? palette.accent : palette.white,
                    cursor: currentPage === totalPages ? "default" : "pointer",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    transition: "background 0.2s",
                  }}
                >
                  Next
                </button>
              </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Leave Details Modal */}
      {showDetailsModal && selectedLeave && (
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
          onClick={handleCloseDetailsModal}
        >
          <div
            className="custom-scrollbar"
            style={{
              background: palette.white,
              borderRadius: 18,
              boxShadow: "0 8px 32px 0 rgba(36,37,38,0.18)",
              padding: 36,
              minWidth: 500,
              maxWidth: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleCloseDetailsModal}
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
                boxShadow: "0 2px 8px #6366f122",
              }}
            >
              Close
            </button>
            <h3 style={{ fontWeight: 800, color: palette.accent, marginBottom: 24, letterSpacing: 0.5 }}>
              Leave Request Details
            </h3>
            
            {/* Leave Information Section */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontWeight: 700, color: palette.accent, marginBottom: 16, fontSize: "1.15rem", borderBottom: `2px solid ${palette.accent}`, paddingBottom: 8 }}>
                Leave Information
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Leave ID:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{selectedLeave.id || "N/A"}</p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Employee ID:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>{getEmployeeId(selectedLeave)}</p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Employee Name:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    {selectedLeave.employeeName || selectedLeave.employee?.name || selectedLeave.employee?.fullName || "N/A"}
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Status:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    {getStatusBadge(selectedLeave.status)}
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Start Date:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    {selectedLeave.startDate ? new Date(selectedLeave.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>End Date:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    {selectedLeave.endDate ? new Date(selectedLeave.endDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Total Days:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    <span style={{ color: palette.accent, fontWeight: 700, fontSize: "1.1rem" }}>
                      {calculateLeaveDays(selectedLeave.startDate, selectedLeave.endDate)} days
                    </span>
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8 }}>
                  <strong style={{ color: palette.accent }}>Applied Date:</strong>
                  <p style={{ margin: 0, marginTop: 4, color: "#1a1a1a", fontWeight: 600 }}>
                    {selectedLeave.createdAt || selectedLeave.appliedDate ? 
                      new Date(selectedLeave.createdAt || selectedLeave.appliedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "N/A"}
                  </p>
                </div>
                <div style={{ padding: 12, background: palette.bg, borderRadius: 8, gridColumn: "1 / -1" }}>
                  <strong style={{ color: palette.accent }}>Reason:</strong>
                  <p style={{ margin: 0, marginTop: 8, color: "#1a1a1a", fontWeight: 600, lineHeight: 1.5 }}>
                    {selectedLeave.reason || "No reason provided"}
                  </p>
                </div>
                {selectedLeave.comments && (
                  <div style={{ padding: 12, background: palette.bg, borderRadius: 8, gridColumn: "1 / -1" }}>
                    <strong style={{ color: palette.accent }}>Comments:</strong>
                    <p style={{ margin: 0, marginTop: 8, color: "#1a1a1a", fontWeight: 600, lineHeight: 1.5 }}>
                      {selectedLeave.comments}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons in Modal */}
            {selectedLeave.status?.toUpperCase() === "PENDING" && (
              <div style={{ marginTop: 24, textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  style={{
                    background: palette.green,
                    color: palette.white,
                    border: `2px solid ${palette.green}`,
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)",
                    transition: "all 0.2s",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => {
                    handleLeaveAction(selectedLeave.id, "approve");
                    handleCloseDetailsModal();
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#16a34a";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(34, 197, 94, 0.6)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = palette.green;
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.4)";
                  }}
                >
                  <FaCheckCircle />
                  Accept Leave
                </button>
                <button
                  style={{
                    background: palette.red,
                    color: palette.white,
                    border: `2px solid ${palette.red}`,
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                    transition: "all 0.2s",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => {
                    handleLeaveAction(selectedLeave.id, "reject");
                    handleCloseDetailsModal();
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#dc2626";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.6)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = palette.red;
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
                  }}
                >
                  <FaTimesCircle />
                  Reject Leave
                </button>
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

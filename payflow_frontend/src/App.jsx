import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/Managerdashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ApplyLeave from "./pages/ApplyLeave";
import LeavesInfo from "./pages/LeavesInfo";
import CTCDetails from "./pages/CTCDetails";
import CTCInfo from "./pages/CTCInfo";
import EmployeeListPage from "./pages/EmployeeListPage";
import EmployeeList from "./pages/Employee/EmployeeList";
import AddEmployee from "./pages/Employee/AddEmployee";
import LeaveRequests from "./pages/Leave/LeaveRequests";
import LeaveApproval from "./pages/Leave/LeaveApproval";
import PayrollProcessing from "./pages/Payroll/PayrollProcessing";
import PayslipGeneration from "./pages/Payroll/PayslipGeneration";
import EmployeePayslips from "./pages/EmployeePayslips";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      <Route path="/apply-leave" element={<ApplyLeave />} />
      <Route path="/leaves-info" element={<LeavesInfo />} />
      <Route path="/ctc-details" element={<CTCDetails />} />
      <Route path="/employee-payslips" element={<EmployeePayslips />} />

      {/* Dashboard routes only accessible if logged in */}
      {user && user.role === "admin" && (
        <>
          <Route path="/admin" element={<AdminDashboard active="dashboard" />} />
          <Route path="/admin/add-user" element={<AdminDashboard active="createForm" />} />
          <Route path="/admin/users" element={<AdminDashboard active="userList" />} />
          <Route path="/admin/employees" element={<EmployeeListPage />} />
        </>
      )}

      {user && (user.role === "HR" || user.role === "hr") && (
        <>
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/employees" element={<HRDashboard />} />
          <Route path="/ctc-info" element={<CTCInfo />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
          <Route path="/payroll-processing" element={<PayrollProcessing />} />
          <Route path="/payslip-generation" element={<PayslipGeneration />} />
        </>
      )}
      {user && (user.role === "MANAGER" || user.role === "manager") && (
        <>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/ctc-info" element={<CTCInfo />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
        </>
      )}

      {/* Common Routes */}
      <Route path="/Employee/AddEmployee/add" element={<AddEmployee />} />
      {/* Employee list accessible to HR/Manager */}
      {user && user.role !== "admin" && (
        <Route path="/employees" element={<HRDashboard />} />
      )}
      
      {/* Catch-all route for unknown paths */}
      <Route path="*" element={<div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/login" style={{ color: "#38bdf8" }}>Go to Login</a>
      </div>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

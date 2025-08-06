import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import DynamicNavigation from "../../components/DynamicNavigation";
import { ToastContainer, toast } from "react-toastify";
import { FaHome, FaUser } from "react-icons/fa";
import { useAuth } from "../../authContext.jsx";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Add custom CSS for date input styling
const dateInputStyle = `
  input[type="date"]::-webkit-calendar-picker-indicator {
    color: #374151 !important;
    opacity: 1 !important;
    cursor: pointer;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') no-repeat center center;
    background-size: 16px 16px;
    filter: none !important;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    background-color: #f3f4f6;
    border-radius: 3px;
  }
`;

// Add style tag to document head
if (typeof document !== 'undefined' && !document.getElementById('date-input-styles')) {
  const style = document.createElement('style');
  style.id = 'date-input-styles';
  style.textContent = dateInputStyle;
  document.head.appendChild(style);
}

export default function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // Fetch managers and current user role when component mounts
    fetchCurrentUserRole();
    fetchManagers();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
      const res = await fetch("/api/employees/current-user-role", {
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        console.log("User data received:", userData); // Debug log
        setCurrentUserRole(userData.role);
        setCurrentUser(userData);
        
        // If user is a manager, auto-set managerId to themselves
        if (userData.role === "MANAGER") {
          setForm(prev => ({ ...prev, managerId: userData.userId }));
        }
      } else {
        console.error("Failed to fetch user role:", res.status);
        // Fallback: assume HR role if API fails
        setCurrentUserRole("HR");
      }
    } catch (error) {
      console.error("Error fetching current user role:", error);
      // Fallback: assume HR role if network error
      setCurrentUserRole("HR");
    }
  };

  const fetchManagers = async () => {
    setManagersLoading(true);
    try {
      const res = await fetch("/api/employees/managers", {
        credentials: "include"
      });
      if (res.ok) {
        const managersData = await res.json();
        console.log("Managers data received:", managersData); // Debug log
        setManagers(managersData);
      } else {
        console.error("Failed to fetch managers:", res.status);
        setManagers([]); // Set empty array if API fails
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]); // Set empty array if network error
    } finally {
      setManagersLoading(false);
    }
  };

  const palette = {
    accent: "#6366f1",
    dark: "#1e293b",
    bg: "#f1f5f9",
    white: "#fff",
  };

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
    address: "",
    gender: "",
    degree: "",
    university: "",
    graduationYear: "",
    grade: "",
    designation: "",
    department: "",
    totalLeaves: "",
    managerId: "",
    pastExperiences: [
      { companyName: "", role: "", years: "" }
    ],
    // CTC Details (HR only)
    ctcDetails: {
      effectiveFrom: "",
      basicSalary: "",
      allowances: "",
      bonuses: "",
      pfContribution: "",
      gratuity: "",
      totalCtc: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePastExpChange = (index, field, value) => {
    const updated = [...form.pastExperiences];
    updated[index][field] = value;
    setForm({ ...form, pastExperiences: updated });
    
    // Clear past experience validation error when user starts typing
    if (validationErrors.pastExperiences) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pastExperiences;
        return newErrors;
      });
    }
  };

  const addPastExperience = () => {
    setForm({
      ...form,
      pastExperiences: [...form.pastExperiences, { companyName: "", role: "", years: "" }]
    });
  };

  const removePastExperience = index => {
    const updated = form.pastExperiences.filter((_, i) => i !== index);
    setForm({ ...form, pastExperiences: updated });
  };

  // Validation state for error messages
  const [validationErrors, setValidationErrors] = useState({});

  // Individual field validators
  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (!/^[A-Za-z\s]+$/.test(name.trim())) return "Full name must contain only letters and spaces";
    if (name.trim().length < 2) return "Full name must be at least 2 characters long";
    if (name.trim().length > 50) return "Full name must be less than 50 characters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 100) return "Email must be less than 100 characters";
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = Number(age);
    if (isNaN(ageNum)) return "Age must be a number";
    if (ageNum < 18) return "Age must be at least 18 years";
    if (ageNum > 100) return "Age must be less than 100 years";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) return "Please enter a valid phone number (10-15 digits)";
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return "Address is required";
    if (address.trim().length < 10) return "Address must be at least 10 characters long";
    if (address.trim().length > 200) return "Address must be less than 200 characters";
    return "";
  };

  const validateGender = (gender) => {
    if (!gender) return "Gender is required";
    if (!["Male", "Female", "Others"].includes(gender)) return "Please select a valid gender";
    return "";
  };

  const validateDegree = (degree) => {
    if (!degree.trim()) return "Degree is required";
    if (!/^[A-Za-z\s.&-]+$/.test(degree.trim())) return "Degree must contain only letters, spaces, dots, ampersands and hyphens";
    if (degree.trim().length < 2) return "Degree must be at least 2 characters long";
    if (degree.trim().length > 100) return "Degree must be less than 100 characters";
    return "";
  };

  const validateUniversity = (university) => {
    if (!university.trim()) return "University is required";
    if (!/^[A-Za-z\s.&-]+$/.test(university.trim())) return "University name must contain only letters, spaces, dots, ampersands and hyphens";
    if (university.trim().length < 2) return "University name must be at least 2 characters long";
    if (university.trim().length > 100) return "University name must be less than 100 characters";
    return "";
  };

  const validateGraduationYear = (year) => {
    if (!year) return "Graduation year is required";
    const yearNum = Number(year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum)) return "Graduation year must be a number";
    if (yearNum < 1950) return "Graduation year must be after 1950";
    if (yearNum > currentYear + 5) return `Graduation year cannot be more than ${currentYear + 5}`;
    return "";
  };

  const validateGrade = (grade) => {
    if (!grade.trim()) return "Grade is required";
    // Allow grades like: A+, A, B+, B, C+, C, D, F, 85%, 3.5 GPA, First Class, etc.
    if (!/^[A-Fa-f][+-]?$|^\d{1,3}(\.\d{1,2})?%?$|^[0-4](\.\d{1,2})?\s?(GPA|gpa)?$|^(First\s?Class|Second\s?Class|Third\s?Class|Pass|Distinction)$/i.test(grade.trim())) {
      return "Please enter a valid grade (e.g., A+, 85%, 3.5 GPA, First Class)";
    }
    return "";
  };

  const validateDesignation = (designation) => {
    if (!designation.trim()) return "Designation is required";
    if (!/^[A-Za-z\s&.-]+$/.test(designation.trim())) return "Designation must contain only letters, spaces, ampersands, dots and hyphens";
    if (designation.trim().length < 2) return "Designation must be at least 2 characters long";
    if (designation.trim().length > 50) return "Designation must be less than 50 characters";
    return "";
  };

  const validateDepartment = (department) => {
    if (!department.trim()) return "Department is required";
    return "";
  };

  const validateTotalLeaves = (leaves) => {
    if (!leaves) return "Total leaves is required";
    const leavesNum = Number(leaves);
    if (isNaN(leavesNum)) return "Total leaves must be a number";
    if (leavesNum < 0) return "Total leaves cannot be negative";
    if (leavesNum > 365) return "Total leaves cannot exceed 365 days";
    return "";
  };

  const validateManagerId = (managerId) => {
    if (currentUserRole === "HR" && !managerId) return "Manager selection is required";
    return "";
  };

  const validatePastExperience = (experiences) => {
    // Filter out completely empty experiences first
    const nonEmptyExperiences = experiences.filter(exp => 
      exp.companyName.trim() || exp.role.trim() || exp.years.toString().trim()
    );
    
    // If no non-empty experiences, validation passes
    if (nonEmptyExperiences.length === 0) return "";
    
    // Validate each non-empty experience
    for (let i = 0; i < nonEmptyExperiences.length; i++) {
      const exp = nonEmptyExperiences[i];
      
      if (!exp.companyName.trim()) return `Company name is required for experience ${i + 1}`;
      if (!/^[A-Za-z\s&.-]+$/.test(exp.companyName.trim())) return `Company name must contain only letters, spaces, ampersands, dots and hyphens for experience ${i + 1}`;
      
      if (!exp.role.trim()) return `Role is required for experience ${i + 1}`;
      if (!/^[A-Za-z\s&.-]+$/.test(exp.role.trim())) return `Role must contain only letters, spaces, ampersands, dots and hyphens for experience ${i + 1}`;
      
      if (!exp.years.toString().trim()) return `Years of experience is required for experience ${i + 1}`;
      const years = Number(exp.years);
      if (isNaN(years)) return `Years must be a number for experience ${i + 1}`;
      if (years < 0) return `Years cannot be negative for experience ${i + 1}`;
      if (years > 50) return `Years cannot exceed 50 for experience ${i + 1}`;
    }
    
    return "";
  };

  // CTC Validation Functions (HR only) - Simplified to only check for numbers
  const validateEffectiveFrom = (date) => {
    if (date && date.trim()) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (selectedDate < today) {
        return "Effective date cannot be in the past";
      }
    }
    return "";
  };

  const validateBasicSalary = (salary) => {
    if (salary && salary.trim()) {
      const salaryNum = Number(salary);
      if (isNaN(salaryNum)) return "Basic salary must be a number";
    }
    return "";
  };

  const validateCTCAmount = (amount, fieldName) => {
    if (amount && amount.trim()) {
      const amountNum = Number(amount);
      if (isNaN(amountNum)) return `${fieldName} must be a number`;
    }
    return "";
  };

  const validateTotalCtc = (totalCtc) => {
    if (totalCtc && totalCtc.trim()) {
      const ctcNum = Number(totalCtc);
      if (isNaN(ctcNum)) return "Total CTC must be a number";
    }
    return "";
  };

  const validateCTCDetails = () => {
    const errors = {};
    const ctc = form.ctcDetails;
    
    // Only validate if fields have values and check if they are numbers
    const effectiveFromError = validateEffectiveFrom(ctc.effectiveFrom);
    if (effectiveFromError) errors.effectiveFrom = effectiveFromError;
    
    const basicSalaryError = validateBasicSalary(ctc.basicSalary);
    if (basicSalaryError) errors.basicSalary = basicSalaryError;
    
    const allowancesError = validateCTCAmount(ctc.allowances, "Allowances");
    if (allowancesError) errors.allowances = allowancesError;
    
    const bonusesError = validateCTCAmount(ctc.bonuses, "Bonuses");
    if (bonusesError) errors.bonuses = bonusesError;
    
    const pfError = validateCTCAmount(ctc.pfContribution, "PF Contribution");
    if (pfError) errors.pfContribution = pfError;
    
    const gratuityError = validateCTCAmount(ctc.gratuity, "Gratuity");
    if (gratuityError) errors.gratuity = gratuityError;
    
    const totalCtcError = validateTotalCtc(ctc.totalCtc);
    if (totalCtcError) errors.totalCtc = totalCtcError;
    
    return errors;
  };

  // Handle CTC field changes
  const handleCTCChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      ctcDetails: {
        ...prev.ctcDetails,
        [name]: value
      }
    }));
    
    // Clear CTC validation errors when user starts typing
    if (validationErrors.ctc && validationErrors.ctc[name]) {
      setValidationErrors(prev => ({
        ...prev,
        ctc: {
          ...prev.ctc,
          [name]: undefined
        }
      }));
    }
  };

  // Auto-calculate total CTC when components change
  const calculateTotalCTC = () => {
    const ctc = form.ctcDetails;
    const basic = Number(ctc.basicSalary) || 0;
    const allowances = Number(ctc.allowances) || 0;
    const bonuses = Number(ctc.bonuses) || 0;
    const pf = Number(ctc.pfContribution) || 0;
    const gratuity = Number(ctc.gratuity) || 0;
    
    const total = basic + allowances + bonuses + pf + gratuity;
    return total.toString();
  };

  // Auto-calculate total CTC when any component changes
  React.useEffect(() => {
    if (currentUserRole === "HR") {
      const newTotal = calculateTotalCTC();
      if (newTotal !== form.ctcDetails.totalCtc) {
        setForm(prev => ({
          ...prev,
          ctcDetails: {
            ...prev.ctcDetails,
            totalCtc: newTotal
          }
        }));
      }
    }
  }, [form.ctcDetails.basicSalary, form.ctcDetails.allowances, 
      form.ctcDetails.bonuses, form.ctcDetails.pfContribution, form.ctcDetails.gratuity, currentUserRole]);

  const validatePage1 = () => {
    const errors = {};
    
    const fullNameError = validateFullName(form.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;
    
    const ageError = validateAge(form.age);
    if (ageError) errors.age = ageError;
    
    const phoneError = validatePhone(form.phone);
    if (phoneError) errors.phone = phoneError;
    
    const addressError = validateAddress(form.address);
    if (addressError) errors.address = addressError;
    
    const genderError = validateGender(form.gender);
    if (genderError) errors.gender = genderError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePage2 = () => {
    const errors = {};
    
    const degreeError = validateDegree(form.degree);
    if (degreeError) errors.degree = degreeError;
    
    const universityError = validateUniversity(form.university);
    if (universityError) errors.university = universityError;
    
    const graduationYearError = validateGraduationYear(form.graduationYear);
    if (graduationYearError) errors.graduationYear = graduationYearError;
    
    const gradeError = validateGrade(form.grade);
    if (gradeError) errors.grade = gradeError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePage3 = () => {
    const errors = {};
    
    const designationError = validateDesignation(form.designation);
    if (designationError) errors.designation = designationError;
    
    const departmentError = validateDepartment(form.department);
    if (departmentError) errors.department = departmentError;
    
    const totalLeavesError = validateTotalLeaves(form.totalLeaves);
    if (totalLeavesError) errors.totalLeaves = totalLeavesError;
    
    const managerIdError = validateManagerId(form.managerId);
    if (managerIdError) errors.managerId = managerIdError;
    
    const pastExperienceError = validatePastExperience(form.pastExperiences);
    if (pastExperienceError) errors.pastExperiences = pastExperienceError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePage4 = () => {
    // Only validate CTC details if user is HR
    if (currentUserRole !== "HR") return true;
    
    const ctcErrors = validateCTCDetails();
    setValidationErrors({ ctc: ctcErrors });
    return Object.keys(ctcErrors).length === 0;
  };

  const handleNext = e => {
    e.preventDefault();
    
    let isValid = false;
    if (page === 1) {
      isValid = validatePage1();
      if (!isValid) {
        toast.error("Please fix the validation errors before proceeding to the next page");
        return;
      }
    } else if (page === 2) {
      isValid = validatePage2();
      if (!isValid) {
        toast.error("Please fix the validation errors before proceeding to the next page");
        return;
      }
    } else if (page === 3) {
      isValid = validatePage3();
      if (!isValid) {
        toast.error("Please fix the validation errors before proceeding to the next page");
        return;
      }
    } else if (page === 4 && user.role === 'HR') {
      isValid = validatePage4();
      if (!isValid) {
        toast.error("Please fix the CTC validation errors before proceeding");
        return;
      }
    }
    
    if (isValid) {
      setValidationErrors({}); // Clear errors when moving to next page
      setPage(page + 1);
    }
  };

  const handleBack = e => {
    e.preventDefault();
    if (page > 1) setPage(page - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validatePage3()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    
    // Validate CTC details for HR users
    if (user.role === 'HR' && !validatePage4()) {
      toast.error("Please fix the CTC validation errors before submitting");
      return;
    }
    
    setLoading(true);
    try {
      // Filter out completely empty experiences and only keep fully complete ones
      const validExperiences = form.pastExperiences.filter(exp => 
        exp.companyName.trim() && exp.role.trim() && exp.years.toString().trim()
      );
      
      // Calculate totalExperience from valid experiences only
      const totalExperience = validExperiences.reduce((sum, exp) => {
        return sum + (Number(exp.years) || 0);
      }, 0);
      
      const employeeData = {
        fullName: form.fullName,
        email: form.email,
        age: Number(form.age),
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        degree: form.degree,
        university: form.university,
        graduationYear: form.graduationYear,
        grade: form.grade,
        designation: form.designation,
        department: form.department, // Explicitly include department
        totalLeaves: Number(form.totalLeaves),
        remLeaves: Number(form.totalLeaves), // Initially same as totalLeaves
        totalExperience,
        managerId: Number(form.managerId),
        pastExperiences: validExperiences.map(exp => ({
          companyName: exp.companyName,
          role: exp.role,
          years: Number(exp.years),
          yearsOfExperience: Number(exp.years)
        }))
      };
      
      // Validate required fields before sending
      const requiredFields = ['fullName', 'email', 'age', 'phone', 'address', 'gender', 'degree', 'university', 'graduationYear', 'grade', 'designation', 'department', 'totalLeaves'];
      const missingFields = requiredFields.filter(field => !employeeData[field] || employeeData[field] === '');
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Validate managerId for HR users
      if (currentUserRole === "HR" && (!employeeData.managerId || isNaN(employeeData.managerId))) {
        console.error("Manager ID is required for HR users and must be a valid number");
        toast.error("Please select a manager");
        return;
      }
      
      console.log("Sending employee data to backend:", employeeData); // Debug log
      
      const res = await fetch("/api/employees/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData)
      });
      
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      if (!res.ok) {
        let errorMessage = `Failed to add employee: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try text
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // Use default message if both fail
          }
        }
        console.error("Error response:", errorMessage);
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON or plain text
      const contentType = res.headers.get('content-type');
      let responseData;
      let newEmployee;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
        console.log("Employee creation response:", responseData);
        
        // Extract employee data from response
        newEmployee = responseData.employee || { id: responseData.id };
        console.log("Employee created successfully:", newEmployee);
        console.log("Full response data:", responseData);
        console.log("Employee ID from response.id:", responseData.id);
        console.log("Employee ID from response.employee.employeeId:", responseData.employee?.employeeId);
      } else {
        // Handle plain text response
        const responseText = await res.text();
        console.log("Employee creation response:", responseText);
        // Create a mock employee object for CTC processing
        newEmployee = { id: Date.now() }; // Temporary ID
      }
      
      // If HR user, save CTC details
      if (user.role === 'HR' && form.ctcDetails.basicSalary) {
        try {
          // Get the employee ID from the response - check multiple possible properties
          const employeeId = newEmployee.employeeId || newEmployee.id || responseData.id;
          
          if (!employeeId) {
            console.error("No employee ID found in response:", { newEmployee, responseData });
            toast.warning("Employee added but CTC details could not be saved - missing employee ID");
          } else {
            const ctcData = {
              effectiveFrom: form.ctcDetails.effectiveFrom,
              basicSalary: parseFloat(form.ctcDetails.basicSalary),
              allowances: parseFloat(form.ctcDetails.allowances),
              bonuses: parseFloat(form.ctcDetails.bonuses),
              pfContribution: parseFloat(form.ctcDetails.pfContribution),
              gratuity: parseFloat(form.ctcDetails.gratuity),
              totalCtc: parseFloat(form.ctcDetails.totalCtc),
              isActive: true
            };
            
            console.log("Sending CTC data to backend for employee ID:", employeeId);
            console.log("CTC data:", ctcData);
            
            const ctcRes = await fetch(`/api/ctc/employee/${employeeId}`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ctcData)
            });
            
            console.log("CTC response status:", ctcRes.status);
            
            if (!ctcRes.ok) {
              const errorText = await ctcRes.text();
              console.error("Failed to save CTC details:", ctcRes.status, errorText);
              toast.warning("Employee added but CTC details could not be saved: " + errorText);
            } else {
              const ctcResponse = await ctcRes.json();
              console.log("CTC details saved successfully:", ctcResponse);
              toast.success("Employee and CTC details added successfully!");
            }
          }
        } catch (ctcError) {
          console.error("Error saving CTC details:", ctcError);
          toast.warning("Employee added but CTC details could not be saved");
        }
      }
      
      // Show success message only if CTC was not processed or if there was no CTC data
      if (user.role !== 'HR' || !form.ctcDetails.basicSalary) {
        toast.success("Employee added successfully!");
      }
      
      // Reset form
      const resetForm = {
        fullName: "",
        email: "",
        age: "",
        phone: "",
        address: "",
        gender: "",
        degree: "",
        university: "",
        graduationYear: "",
        grade: "",
        designation: "",
        department: "",
        totalLeaves: "",
        managerId: currentUserRole === "MANAGER" ? currentUser?.userId || "" : "",
        pastExperiences: [{ companyName: "", role: "", years: "" }],
        ctcDetails: {
          effectiveFrom: "",
          basicSalary: "",
          allowances: "",
          bonuses: "",
          pfContribution: "",
          gratuity: "",
          totalCtc: ""
        }
      };
      setForm(resetForm);
      setPage(1);
      
      // Redirect to employee list after short delay to show toast
      setTimeout(() => {
        navigate("/employees");
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for displaying validation errors
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div style={{
        color: "#ef4444",
        fontSize: "0.875rem",
        marginTop: "4px",
        fontWeight: 500
      }}>
        {error}
      </div>
    );
  };

  const pages = [
    // Page 1: Personal Details
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Personal Details</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Full Name</label>
          <input 
            name="fullName" 
            value={form.fullName} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.fullName ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.fullName} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Email</label>
          <input 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            type="email" 
            style={{
              ...inputStyle,
              borderColor: validationErrors.email ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.email} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Age</label>
          <input 
            name="age" 
            value={form.age} 
            onChange={handleChange} 
            type="number" 
            style={{
              ...inputStyle,
              borderColor: validationErrors.age ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.age} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Phone</label>
          <input 
            name="phone" 
            value={form.phone} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.phone ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.phone} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Gender</label>
          <select 
            name="gender" 
            value={form.gender} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.gender ? "#ef4444" : "#cbd5e1"
            }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
          <ErrorMessage error={validationErrors.gender} />
        </div>
        <div style={{ gridColumn: "1 / span 2", display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Address</label>
          <input 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.address ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.address} />
        </div>
      </div>
    </div>,
    // Page 2: Education (all fields)
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Education</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Degree</label>
          <input 
            name="degree" 
            value={form.degree} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.degree ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.degree} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>University</label>
          <input 
            name="university" 
            value={form.university} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.university ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.university} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Graduation Year</label>
          <input 
            name="graduationYear" 
            value={form.graduationYear} 
            onChange={handleChange} 
            type="number"
            style={{
              ...inputStyle,
              borderColor: validationErrors.graduationYear ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.graduationYear} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Grade</label>
          <input 
            name="grade" 
            value={form.grade} 
            onChange={handleChange} 
            placeholder="e.g., A+, 85%, 3.5 GPA, First Class"
            style={{
              ...inputStyle,
              borderColor: validationErrors.grade ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.grade} />
        </div>
      </div>
    </div>,
    // Page 3: Designation and Past Experience
    <div>
      <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>Designation & Experience</h3>
      
      {/* Designation, Department, Manager and Total Leaves Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Designation</label>
          <input 
            name="designation" 
            value={form.designation} 
            onChange={handleChange} 
            placeholder="Enter job designation/title"
            style={{
              ...inputStyle,
              borderColor: validationErrors.designation ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.designation} />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Department</label>
          <select 
            name="department" 
            value={form.department} 
            onChange={handleChange} 
            style={{
              ...inputStyle,
              borderColor: validationErrors.department ? "#ef4444" : "#cbd5e1"
            }}
          >
            <option value="">Select Department</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="IT">IT</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Legal">Legal</option>
            <option value="Research & Development">Research & Development</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Product Management">Product Management</option>
          </select>
          <ErrorMessage error={validationErrors.department} />
        </div>
        
        {/* Manager Selection - Conditional based on role */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Manager</label>
          {currentUserRole === "HR" ? (
            <>
              <select 
                name="managerId" 
                value={form.managerId} 
                onChange={handleChange} 
                style={{
                  ...inputStyle,
                  borderColor: validationErrors.managerId ? "#ef4444" : "#cbd5e1"
                }}
                disabled={managersLoading}
              >
                <option value="">
                  {managersLoading ? "Loading managers..." : "Select a Manager"}
                </option>
                {!managersLoading && managers.length > 0 ? (
                  managers.map(manager => (
                    <option key={manager.userId || manager.id} value={manager.userId || manager.id}>
                      {manager.username || manager.name || manager.fullName} ({manager.email})
                    </option>
                  ))
                ) : !managersLoading && managers.length === 0 ? (
                  <option disabled>No managers available</option>
                ) : null}
              </select>
              <ErrorMessage error={validationErrors.managerId} />
            </>
          ) : currentUserRole === "MANAGER" ? (
            <div style={{
              ...inputStyle,
              backgroundColor: "#f0f0f0",
              color: "#666",
              display: "flex",
              alignItems: "center"
            }}>
              {currentUser?.username || currentUser?.name || "Manager"} (You) - Auto-assigned
            </div>
          ) : currentUserRole === null ? (
            <div style={{
              ...inputStyle,
              backgroundColor: "#f0f0f0",
              color: "#666",
              display: "flex",
              alignItems: "center"
            }}>
              Loading user role...
            </div>
          ) : (
            // Fallback for unknown roles - treat as HR
            <>
              <select 
                name="managerId" 
                value={form.managerId} 
                onChange={handleChange} 
                style={{
                  ...inputStyle,
                  borderColor: validationErrors.managerId ? "#ef4444" : "#cbd5e1"
                }}
                disabled={managersLoading}
              >
                <option value="">
                  {managersLoading ? "Loading managers..." : "Select a Manager"}
                </option>
                {!managersLoading && managers.length > 0 ? (
                  managers.map(manager => (
                    <option key={manager.userId || manager.id} value={manager.userId || manager.id}>
                      {manager.username || manager.name || manager.fullName} ({manager.email})
                    </option>
                  ))
                ) : !managersLoading && managers.length === 0 ? (
                  <option disabled>No managers available</option>
                ) : null}
              </select>
              <ErrorMessage error={validationErrors.managerId} />
            </>
          )}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 10, gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Total Leaves Per Year</label>
          <input 
            name="totalLeaves" 
            value={form.totalLeaves} 
            onChange={handleChange} 
            type="number"
            min="0"
            max="365"
            placeholder="Enter total leaves per year"
            style={{
              ...inputStyle,
              borderColor: validationErrors.totalLeaves ? "#ef4444" : "#cbd5e1"
            }} 
          />
          <ErrorMessage error={validationErrors.totalLeaves} />
        </div>
      </div>

      {/* Past Experience Section */}
      <div style={{ marginTop: 8 }}>
        <h4 style={{ fontWeight: 600, fontSize: "1.1rem", color: "#6366f1", marginBottom: 12 }}>Past Experience (Optional)</h4>
        {validationErrors.pastExperiences && (
          <ErrorMessage error={validationErrors.pastExperiences} />
        )}
        {form.pastExperiences.map((exp, index) => (
          <div key={index} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input 
              placeholder="Company" 
              value={exp.companyName} 
              onChange={e => handlePastExpChange(index, "companyName", e.target.value)} 
              style={{ ...inputStyle, flex: 2 }} 
            />
            <input 
              placeholder="Role" 
              value={exp.role} 
              onChange={e => handlePastExpChange(index, "role", e.target.value)} 
              style={{ ...inputStyle, flex: 2 }} 
            />
            <input 
              placeholder="Years" 
              type="number" 
              min="0" 
              max="50" 
              value={exp.years} 
              onChange={e => handlePastExpChange(index, "years", e.target.value)} 
              style={{ ...inputStyle, flex: 1 }} 
            />
            {form.pastExperiences.length > 1 && (
              <button onClick={() => removePastExperience(index)} type="button" style={{ ...buttonStyle, background: "#f87171", marginTop: 0, height: 38 }}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={addPastExperience} type="button" style={{ ...buttonStyle, background: "#22d3ee", marginBottom: 12 }}>
          + Add Experience
        </button>
      </div>
    </div>
  ];

  // Add CTC details page for HR users only
  if (user.role === 'HR') {
    pages.push(
      // Page 4: CTC Details (HR only)
      <div>
        <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#6366f1", marginBottom: 18, letterSpacing: 0.5 }}>CTC Details</h3>
        <p style={{ color: "#64748b", marginBottom: 20, fontSize: "0.9rem" }}>
          Configure compensation and benefits for the new employee
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 60, rowGap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Effective From</label>
            <input 
              name="effectiveFrom" 
              value={form.ctcDetails.effectiveFrom} 
              onChange={handleCTCChange} 
              type="date"
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.effectiveFrom ? "#ef4444" : "#cbd5e1",
                colorScheme: "light"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.effectiveFrom} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Basic Salary (₹)</label>
            <input 
              name="basicSalary" 
              value={form.ctcDetails.basicSalary} 
              onChange={handleCTCChange} 
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter basic salary"
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.basicSalary ? "#ef4444" : "#cbd5e1"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.basicSalary} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Allowances (₹)</label>
            <input 
              name="allowances" 
              value={form.ctcDetails.allowances} 
              onChange={handleCTCChange} 
              type="number"
              min="0"
              step="0.01"
              placeholder="HRA, Transport, Medical, etc."
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.allowances ? "#ef4444" : "#cbd5e1"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.allowances} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Annual Bonuses (₹)</label>
            <input 
              name="bonuses" 
              value={form.ctcDetails.bonuses} 
              onChange={handleCTCChange} 
              type="number"
              min="0"
              step="0.01"
              placeholder="Performance, festival bonuses"
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.bonuses ? "#ef4444" : "#cbd5e1"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.bonuses} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>PF Contribution (₹)</label>
            <input 
              name="pfContribution" 
              value={form.ctcDetails.pfContribution} 
              onChange={handleCTCChange} 
              type="number"
              min="0"
              step="0.01"
              placeholder="Provident Fund"
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.pfContribution ? "#ef4444" : "#cbd5e1"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.pfContribution} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Gratuity (₹)</label>
            <input 
              name="gratuity" 
              value={form.ctcDetails.gratuity} 
              onChange={handleCTCChange} 
              type="number"
              min="0"
              step="0.01"
              placeholder="Annual gratuity amount"
              style={{
                ...inputStyle,
                borderColor: validationErrors.ctc?.gratuity ? "#ef4444" : "#cbd5e1"
              }} 
            />
            <ErrorMessage error={validationErrors.ctc?.gratuity} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>Total CTC (₹)</label>
            <input 
              name="totalCtc" 
              value={form.ctcDetails.totalCtc} 
              readOnly
              style={{
                ...inputStyle,
                backgroundColor: "#f8fafc",
                fontWeight: "600",
                color: "#1e293b"
              }} 
            />
            <small style={{ color: "#64748b", fontSize: "0.85rem" }}>
              Auto-calculated from above components
            </small>
          </div>
        </div>
      </div>
    );
  }

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
          <main style={{ padding: "2.5rem 3rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 800, background: "#fff", padding: "3rem", borderRadius: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 24, color: "#1e293b" }}>Add Employee</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {pages[page - 1]}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              {page > 1 && <button type="button" onClick={handleBack} style={buttonStyle}>Back</button>}
              {page < pages.length && (
                <button
                  type="button"
                  onClick={handleNext}
                  style={buttonStyle}
                >
                  Next
                </button>
              )}
              {page === pages.length && (
                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
        </div>
        <ToastContainer />
      </main>
    </div>
  </div>
  );
}

// Reusable styles
const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1.5px solid #cbd5e1",
  backgroundColor: "#f8fafc",
  width: "100%",
  fontSize: "1rem",
  color: "#111"
};

const buttonStyle = {
  background: "#6366f1",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer"
};

const labelStyle = {
  fontWeight: 600,
  fontSize: "1rem",
  marginBottom: 4,
  color: "#334155"
};

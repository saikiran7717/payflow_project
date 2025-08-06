package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.PastExperience;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.UserRepository;
import com.example.payflow_backend.service.EmailService;
import com.example.payflow_backend.service.EmployeeService;
import com.example.payflow_backend.service.PastExperienceService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

// ... (keep your package and imports unchanged)

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final PastExperienceService pastExperienceService;

    @Autowired private EmployeeRepository employeeRepo;

    public EmployeeController(EmployeeService service, EmailService emailService,
                              PasswordEncoder passwordEncoder, UserRepository userRepository,
                              PastExperienceService pastExperienceService) {
        this.service = service;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.pastExperienceService = pastExperienceService;
    }

    // ✅ Modified Add Employee (Handles pastExperiences directly)
    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @PostMapping("/add")
    public ResponseEntity<?> addEmployee(@RequestBody Map<String, Object> employeeData, Authentication authentication) {
        try {
            Employee employee = new Employee();
            employee.setFullName((String) employeeData.get("fullName"));
            employee.setEmail((String) employeeData.get("email"));
            employee.setAge(((Number) employeeData.get("age")).intValue());
            employee.setPhone((String) employeeData.get("phone"));
            employee.setGender((String) employeeData.get("gender"));
            employee.setAddress((String) employeeData.get("address"));
            employee.setDegree((String) employeeData.get("degree"));
            employee.setUniversity((String) employeeData.get("university"));
            employee.setGraduationYear((String) employeeData.get("graduationYear"));
            employee.setGrade((String) employeeData.get("grade"));
            employee.setDesignation((String) employeeData.get("designation"));
            employee.setDepartment((String) employeeData.get("department"));
            employee.setTotalLeaves(((Number) employeeData.get("totalLeaves")).intValue());
            employee.setRemLeaves(((Number) employeeData.get("totalLeaves")).intValue());
            employee.setTotalExperience(((Number) employeeData.get("totalExperience")).intValue());

            if (service.existsByEmail(employee.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee with this email already exists."));
            }

            String username = authentication.getName();
            User onboardedBy = userRepository.findByEmail(username).orElse(null);
            if (onboardedBy == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or user not found."));
            }

            // Handle manager assignment based on user role
            User manager = null;
            if ("HR".equals(onboardedBy.getRole())) {
                // HR can select any manager
                Long managerId = employeeData.get("managerId") != null ? 
                    ((Number) employeeData.get("managerId")).longValue() : null;
                
                if (managerId != null) {
                    manager = userRepository.findById(managerId).orElse(null);
                    if (manager == null || !"MANAGER".equals(manager.getRole())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid manager selected."));
                    }
                }
            } else if ("MANAGER".equals(onboardedBy.getRole())) {
                // Manager can only assign themselves as manager
                manager = onboardedBy;
            }
            
            employee.setManager(manager);

            String tempPassword = UUID.randomUUID().toString().substring(0, 8);

            employee.setPasswordHash(tempPassword);
            employee.setIsTempPassword(true);
            employee.setOnboardedBy(onboardedBy);
            employee.setOnboardedAt(java.time.LocalDateTime.now());

            // Handle past experiences
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> experiencesData = (List<Map<String, Object>>) employeeData.get("pastExperiences");
            List<PastExperience> experiences = new ArrayList<>();
            
            if (experiencesData != null) {
                for (Map<String, Object> expData : experiencesData) {
                    PastExperience exp = new PastExperience();
                    exp.setCompanyName((String) expData.get("companyName"));
                    exp.setRole((String) expData.get("role"));
                    exp.setYearsOfExperience(((Number) expData.get("years")).intValue());
                    experiences.add(exp);
                }
            }

            Employee savedEmployee = service.addEmployee(employee);

            // Link and save experiences (if any)
            if (!experiences.isEmpty()) {
                for (PastExperience exp : experiences) {
                    exp.setEmployee(savedEmployee);
                }
                pastExperienceService.saveAllExperiences(experiences, savedEmployee.getEmployeeId());
            }

            emailService.sendCredentials(employee.getEmail(), tempPassword);
            
            // Return the created employee as JSON instead of plain text
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Employee added and credentials emailed successfully.");
            response.put("employee", savedEmployee);
            response.put("id", savedEmployee.getEmployeeId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error adding employee: " + e.getMessage()));
        }
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Employee>> getAllEmployees(Authentication authentication) {
        // Check if the user is a manager
        if (authentication != null) {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            
            if (currentUser != null && "MANAGER".equals(currentUser.getRole())) {
                // Manager can only see their own employees
                List<Employee> managedEmployees = employeeRepo.findByManagerUserIdAndIsActiveTrue(currentUser.getUserId());
                return ResponseEntity.ok(managedEmployees);
            }
        }
        
        // HR and ADMIN can see all employees
        List<Employee> employees = service.getAll();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/managers")
    public ResponseEntity<List<User>> getAllManagers() {
        List<User> managers = userRepository.findAllActiveManagers();
        return ResponseEntity.ok(managers);
    }

    @GetMapping("/current-user-role")
    public ResponseEntity<Map<String, String>> getCurrentUserRole(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);
        
        if (currentUser == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        
        return ResponseEntity.ok(Map.of(
            "role", currentUser.getRole(),
            "userId", currentUser.getUserId().toString(),
            "username", currentUser.getUsername()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req, HttpServletRequest request) {
        String email = req.get("email");
        String password = req.get("password");
        Employee emp = service.login(email, password);
        System.out.println("Login attempt for email: " + email);
        System.out.println("is Employee null : " + (emp == null));
        if (emp == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        if (!emp.getIsActive()) { // status == false means disabled
            return ResponseEntity.status(403).body(Map.of("error", "Your account is disabled. Please contact admin."));
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null, service.getAuthorities(emp));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "employeeId", emp.getEmployeeId(),
                "requiresPasswordReset", emp.isTempPassword(),
                "sessionId", session.getId()
        ));
    }

    @PostMapping("/employee/reset-password")
    public ResponseEntity<?> resetEmployeePassword(@RequestBody Map<String, String> req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        String email = principal.getName();
        String oldPassword = req.get("oldPassword");
        String newPassword = req.get("newPassword");

        Optional<Employee> empOpt = employeeRepo.findByEmail(email);
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Employee not found"));
        }

        Employee emp = empOpt.get();

        if (!Boolean.TRUE.equals(emp.isTempPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password reset is not required"));
        }

        if (!passwordEncoder.matches(oldPassword, emp.getPasswordHash())) {
            return ResponseEntity.status(403).body(Map.of("error", "Old password is incorrect"));
        }

        emp.setPasswordHash(passwordEncoder.encode(newPassword));
        emp.setIsTempPassword(false);
        employeeRepo.save(emp);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Employee logged out.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        System.out.println("======fetching profile using me ======================");
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        System.out.println(" authentication: " + auth.getName());
        String email = auth.getName();
        Employee emp = employeeRepo.findByEmail(email).orElse(null);

        if (emp == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Employee not found for: " + email));
        }

        return ResponseEntity.ok(emp);
    }

    @PreAuthorize("hasAnyRole('HR','MANAGER','ADMIN')")
    @GetMapping("/{employeeId}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long employeeId, Authentication authentication) {
        try {
            Employee emp = employeeRepo.findById(employeeId).orElse(null);

            if (emp == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Employee not found with ID: " + employeeId));
            }

            // Check if the user is a manager and if they can access this employee
            if (authentication != null) {
                String email = authentication.getName();
                User currentUser = userRepository.findByEmail(email).orElse(null);
                
                if (currentUser != null && "MANAGER".equals(currentUser.getRole())) {
                    // Manager can only see their own employees
                    if (emp.getManager() == null || !emp.getManager().getUserId().equals(currentUser.getUserId())) {
                        return ResponseEntity.status(403).body(Map.of("error", "Access denied. You can only view your own employees."));
                    }
                }
            }

            return ResponseEntity.ok(emp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching employee details"));
        }
    }



    // --------------------------
    // Past Experience Endpoints
    // --------------------------

    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @PostMapping("/{employeeId}/experiences")
    public ResponseEntity<PastExperience> addExperience(@PathVariable Long employeeId,
                                                        @RequestBody PastExperience experience) {
        PastExperience saved = pastExperienceService.saveExperience(experience, employeeId);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @PostMapping("/{employeeId}/experiences/bulk")
    public ResponseEntity<List<PastExperience>> addMultipleExperiences(@PathVariable Long employeeId,
                                                                       @RequestBody List<PastExperience> experiences) {
        List<PastExperience> savedList = pastExperienceService.saveAllExperiences(experiences, employeeId);
        return ResponseEntity.ok(savedList);
    }

    @PreAuthorize("hasAnyRole('HR','MANAGER','EMPLOYEE')")
    @GetMapping("/{employeeId}/experiences")
    public ResponseEntity<List<PastExperience>> getExperiencesByEmployee(@PathVariable Long employeeId) {
        List<PastExperience> experiences = pastExperienceService.getExperiencesByEmployeeId(employeeId);
        return ResponseEntity.ok(experiences);
    }

    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @PutMapping("/{employeeId}/experiences/{experienceId}")
    public ResponseEntity<PastExperience> updateExperience(@PathVariable Long experienceId,
                                                           @RequestBody PastExperience updatedExperience) {
        PastExperience updated = pastExperienceService.updateExperience(experienceId, updatedExperience);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @DeleteMapping("/{employeeId}/experiences/{experienceId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long experienceId) {
        pastExperienceService.deleteExperience(experienceId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("{employeeId}/status")
    public ResponseEntity<Employee> updateEmployeeStatus(@PathVariable Long employeeId, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setIsActive(isActive);
        employeeRepo.save(employee);
        return ResponseEntity.ok(employee);
    }

    // ✅ Admin endpoint to reset extra leaves for all employees (for testing/monthly reset)
    @PostMapping("/reset-extra-leaves")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Map<String, Object>> resetExtraLeaves() {
        List<Employee> allEmployees = employeeRepo.findAll();
        int resetCount = 0;
        
        for (Employee employee : allEmployees) {
            employee.setExtraLeavesThisMonth(0);
            resetCount++;
        }
        
        employeeRepo.saveAll(allEmployees);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Extra leaves reset successfully for all employees");
        response.put("employeesAffected", resetCount);
        response.put("timestamp", new Date());
        
        return ResponseEntity.ok(response);
    }


}

package com.example.payflow_backend.controller;

import com.example.payflow_backend.dto.AuthRequest;
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
import org.springframework.security.authentication.AuthenticationManager;
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

    @Autowired private AuthenticationManager authManager;
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
    public ResponseEntity<String> addEmployee(@RequestBody Employee employee) {
        if (service.existsByEmail(employee.getEmail())) {
            return ResponseEntity.badRequest().body("Employee with this email already exists.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User onboardedBy = userRepository.findByEmail(username).orElse(null);
        if (onboardedBy == null) {
            return ResponseEntity.status(401).body("Unauthorized or user not found.");
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        String hashedPassword = passwordEncoder.encode(tempPassword);

        employee.setPasswordHash(hashedPassword);
        employee.setIsTempPassword(true);
        employee.setOnboardedBy(onboardedBy);
        employee.setOnboardedAt(java.time.LocalDateTime.now());

        // Extract and detach past experiences before saving
        List<PastExperience> experiences = employee.getPastExperiences();
        employee.setPastExperiences(null); // Avoid circular save issue

        Employee savedEmployee = service.addEmployee(employee);

        // Link and save experiences (if any)
        if (experiences != null && !experiences.isEmpty()) {
            for (PastExperience exp : experiences) {
                exp.setEmployee(savedEmployee);
            }
            pastExperienceService.saveAllExperiences(experiences, savedEmployee.getEmployeeId());
        }

        emailService.sendCredentials(employee.getEmail(), tempPassword);
        return ResponseEntity.ok("Employee added and credentials emailed successfully.");
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = service.getAll();
        return ResponseEntity.ok(employees);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req, HttpServletRequest request) {
        String email = req.get("email");
        String password = req.get("password");

        Employee emp = service.login(email, password);
        if (emp == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
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
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String email = auth.getName();
        Employee emp = employeeRepo.findByEmail(email).orElse(null);

        if (emp == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Employee not found for: " + email));
        }

        return ResponseEntity.ok(emp);
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
}

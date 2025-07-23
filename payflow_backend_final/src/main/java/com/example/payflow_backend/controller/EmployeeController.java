package com.example.payflow_backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.UserRepository;
import com.example.payflow_backend.service.EmailService;
import com.example.payflow_backend.service.EmployeeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public EmployeeController(EmployeeService service, EmailService emailService, PasswordEncoder passwordEncoder, UserRepository userRepository  ) {
        this.service = service;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Autowired private AuthenticationManager authManager;
    @Autowired private EmployeeRepository employeeRepo;



    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @PostMapping("/add")
    public ResponseEntity<String> addEmployee(@RequestBody Employee employee) {
        if (service.existsByEmail(employee.getEmail())) {
            return ResponseEntity.badRequest().body("Employee with this email already exists.");
        }

        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // assuming username = email

        // Find user from repository
        User onboardedBy = userRepository.findByEmail(username)
                .orElse(null); // handle null if needed

        if (onboardedBy == null) {
            return ResponseEntity.status(401).body("Unauthorized or user not found.");
        }

        // Generate temporary password
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        String hashedPassword = passwordEncoder.encode(tempPassword);

        employee.setPasswordHash(hashedPassword);
        employee.setIsTempPassword(true);
        employee.setOnboardedBy(onboardedBy);
        employee.setOnboardedAt(java.time.LocalDateTime.now());

        service.addEmployee(employee);
        emailService.sendCredentials(employee.getEmail(), tempPassword);

        return ResponseEntity.ok("Employee added and credentials emailed successfully.");
    }



    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req, HttpServletRequest request) {
        String email = req.get("email");
        String password = req.get("password");

        Employee emp = service.login(email, password);
        if (emp == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // Set Spring Security context manually
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

        if (!emp.isTempPassword()) {
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

}

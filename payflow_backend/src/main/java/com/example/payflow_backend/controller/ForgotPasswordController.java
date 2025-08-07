package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.repository.AdminRepository;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.UserRepository;
import com.example.payflow_backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ForgotPasswordController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private EmailService emailService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String role = request.get("role");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            if (role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
            }

            String password = null;
            String username = null;

            // Check based on role
            if ("user".equalsIgnoreCase(role)) {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    // For users, we need to decode the password or generate a temporary one
                    // Since passwords are encrypted, we'll send a message indicating a new password
                    username = user.getUsername();
                    password = "Please contact HR/Manager for password reset";
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email not found for User role"));
                }
            } else if ("employee".equalsIgnoreCase(role)) {
                Optional<Employee> employeeOpt = employeeRepository.findByEmail(email);
                if (employeeOpt.isPresent()) {
                    Employee employee = employeeOpt.get();
                    username = employee.getFullName();
                    // For employees, the temporary password is usually email prefix + @123
                    String tempPassword = email.substring(0, email.indexOf("@")) + "@123";
                    password = tempPassword;
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email not found for Employee role"));
                }
            } else if ("admin".equalsIgnoreCase(role)) {
                Optional<Admin> adminOpt = adminRepository.findByEmail(email);
                if (adminOpt.isPresent()) {
                    Admin admin = adminOpt.get();
                    username = admin.getUsername();
                    // For admin, we know the default password is "admin"
                    password = "admin";
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email not found for Admin role"));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role specified"));
            }

            // Send email with password
            try {
                emailService.sendPasswordEmail(email, username, password, role);
                return ResponseEntity.ok(Map.of("message", "Password sent to your email successfully"));
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send email. Please try again later."));
            }

        } catch (Exception e) {
            System.err.println("Forgot password error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }
}

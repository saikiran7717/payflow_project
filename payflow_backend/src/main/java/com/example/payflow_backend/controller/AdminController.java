package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/admins")
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final AdminService adminService;

    public AdminController(AdminService adminService, AuthenticationManager authenticationManager) {
        this.adminService = adminService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");

            // Validate input
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }

            Admin newAdmin = adminService.register(username.trim(), email.trim(), password);
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful",
                    "adminId", newAdmin.getAdminId(),
                    "email", newAdmin.getEmail(),
                    "username", newAdmin.getUsername()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Log the full exception for debugging
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }


    // Login is handled by Spring Security's formLogin configuration

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(Principal principal) {
        // Principal contains the logged-in admin’s email
        if (principal == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        Optional<Admin> optionalAdmin = adminService.findByEmail(principal.getName());
        if (optionalAdmin.isEmpty()) {
            return ResponseEntity.status(404).body("Admin not found");
        }
        Admin admin = optionalAdmin.get();

        return ResponseEntity.ok(admin);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
    	System.out.println("---admin logout called---");
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // Destroy session
        }
        return ResponseEntity.ok("Logged out successfully");
    }




    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            // Set the authentication in Spring Security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create session to persist login
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            Admin admin = adminService.findByEmail(email).get();

            return ResponseEntity.ok(Map.of(
            		"role", "admin",
                    "message", "Login successful",
                    "adminId", admin.getAdminId(),
                    "sessionId", session.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

}

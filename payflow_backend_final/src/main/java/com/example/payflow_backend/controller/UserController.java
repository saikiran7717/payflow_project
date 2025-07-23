package com.example.payflow_backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.service.AdminService;
import com.example.payflow_backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AdminService adminService;

    public UserController(UserService userService, AdminService adminService) {
        this.userService = userService;
        this.adminService = adminService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized: Admin not logged in");
        }

        String adminEmail = principal.getName();
        Optional<Admin> adminOpt = userService.getAdminByEmail(adminEmail);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Admin not found");
        }

        String username = (String) req.get("username");
        String email = (String) req.get("email");
        String role = (String) req.get("role");

        // Check for existing username or email
        if (userService.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        Admin createdBy = adminOpt.get();

        User user = userService.registerUser(username, email, role, createdBy.getAdminId());

        return ResponseEntity.ok().body(user);
    }

    /** ✅ User Login */

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req, HttpServletRequest request) {
        String email = req.get("email");
        String password = req.get("password");

        User user = userService.login(email, password);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // Add this check
        System.out.println("status : "+user.isStatus());
        if (!user.isStatus()) { // status == false means disabled
            return ResponseEntity.status(403).body(Map.of("error", "Your account is disabled. Please contact admin."));
        }

        // Manually set Spring Security Authentication
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null, userService.getAuthorities(user));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        // Check if temporary password
        boolean requiresPasswordReset = user.getIsTempPassword();

        System.out.println("is password required : " +requiresPasswordReset);
        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "userId", user.getUserId(),
                "role", user.getRole(),
                "requiresPasswordReset", requiresPasswordReset,
                "sessionId", session.getId()
        ));
    }



    /** ✅ Get logged-in user details */
    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        return userService.findByEmail(principal.getName())
                .map(user -> ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Unauthorized"))
);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        String email = principal.getName();
        String oldPassword = req.get("oldPassword");
        String newPassword = req.get("newPassword");

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Check if temp password is still active
        if (!user.getIsTempPassword()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password reset not required"));
        }

        // Verify old password
        if (!userService.verifyPassword(user, oldPassword)) {
            return ResponseEntity.status(403).body(Map.of("error", "Old password is incorrect"));
        }

        // Update to new password
        userService.resetPassword(user, newPassword);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }



    /** ✅ Logout user */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
    	System.out.println("---User logout called---");
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/getAllUsers")
    public List<User> getAllUsers() {
    	return userService.getAllUsers();
    }

 // Update user status (enable/disable)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Boolean status = (Boolean) payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body("Missing status value");
        }
        boolean updated = userService.updateUserStatus(id, status);
        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok("User status updated");
    }
}

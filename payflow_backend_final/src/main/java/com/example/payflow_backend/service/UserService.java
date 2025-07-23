package com.example.payflow_backend.service;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.repository.AdminRepository;
import com.example.payflow_backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.RandomStringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(
            UserRepository userRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }


    public User registerUser(String username, String email, String role, Long createdByAdminId) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        String plainPassword = RandomStringUtils.randomAlphanumeric(10);
        String hashedPassword = passwordEncoder.encode(plainPassword);

        Admin admin = adminRepository.findById(createdByAdminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setRole(role.toUpperCase());
        user.setIsTempPassword(true);
        user.setCreatedBy(admin); // ✅ fixed

        User savedUser = userRepository.save(user);
        emailService.sendCredentials(email, plainPassword);

        return savedUser;
    }

    public Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }


    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!new BCryptPasswordEncoder().matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean verifyPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public void resetPassword(User user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setIsTempPassword(false);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
    	return userRepository.findAll();
    }

    public boolean updateUserStatus(Long id, boolean status) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return false;
        }
        User user = userOpt.get();
        user.setStatus(status); // true = active, false = inactive
        userRepository.save(user);
        return true;
    }
}

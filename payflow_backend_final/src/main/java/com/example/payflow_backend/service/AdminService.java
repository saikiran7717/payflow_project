package com.example.payflow_backend.service;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.repository.AdminRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // ✅ Register new admin with uniqueness checks
    public Admin register(String username, String email, String password) {
        if (adminRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered. Please use a different email.");
        }

        if (adminRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already taken. Please choose a different username.");
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPasswordHash(encoder.encode(password));
        return adminRepository.save(admin);
    }

    public Optional<Admin> findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }
}


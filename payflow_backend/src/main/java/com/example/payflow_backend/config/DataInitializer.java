package com.example.payflow_backend.config;

import com.example.payflow_backend.model.Admin;
import com.example.payflow_backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        initializeDefaultAdmin();
    }

    private void initializeDefaultAdmin() {
        try {
            // Check if admin table is empty
            long adminCount = adminRepository.count();
            
            if (adminCount == 0) {
                System.out.println("Admin table is empty. Creating default admin...");
                
                // Create default admin
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername("Admin");
                defaultAdmin.setEmail("admin@gmail.com");
                defaultAdmin.setPasswordHash(passwordEncoder.encode("admin"));
                
                // Save the admin
                adminRepository.save(defaultAdmin);
                
                System.out.println("Default admin created successfully:");
                System.out.println("Email: admin@gmail.com");
                System.out.println("Password: admin");
                System.out.println("Username: Admin");
            } else {
                System.out.println("Admin table already has " + adminCount + " record(s). Skipping default admin creation.");
            }
        } catch (Exception e) {
            System.err.println("Error initializing default admin: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

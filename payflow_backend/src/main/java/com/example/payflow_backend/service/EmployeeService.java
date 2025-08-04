package com.example.payflow_backend.service;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.repository.EmployeeRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository repo;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ Add new employee (with encoding, default flags, timestamps)
    public Employee addEmployee(Employee e) {
        e.setPasswordHash(passwordEncoder.encode(e.getPasswordHash())); // encode raw password
        e.setIsTempPassword(true); // force change on first login
        e.setOnboardedAt(LocalDateTime.now());
        e.setIsActive(true); // explicitly mark active
        return repo.save(e);
    }

    // ✅ Get all employees
    public List<Employee> getAll() {
        return repo.findAll();
    }

    // ✅ Check if email exists
    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    // ✅ Authenticate employee by email + password
    public Employee login(String email, String rawPassword) {
        Optional<Employee> empOpt = repo.findByEmail(email);
        if (empOpt.isEmpty()) return null;

        Employee emp = empOpt.get();
        if (passwordEncoder.matches(rawPassword, emp.getPasswordHash())) {
            return emp;
        }
        return null;
    }

    // ✅ Return authorities (can be dynamic in future)
    public Collection<? extends GrantedAuthority> getAuthorities(Employee emp) {
        return List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
    }

    // ✅ Deactivate (soft delete)
    public void deactivateEmployee(Long employeeId) {
        repo.findById(employeeId).ifPresent(emp -> {
            emp.setIsActive(false);
            repo.save(emp);
        });
    }

    // ✅ Update password (e.g., after first login)
    public boolean updatePassword(Long employeeId, String newRawPassword) {
        return repo.findById(employeeId).map(emp -> {
            emp.setPasswordHash(passwordEncoder.encode(newRawPassword));
            emp.setIsTempPassword(false);
            repo.save(emp);
            return true;
        }).orElse(false);
    }

    // ✅ Get by ID (optional use in frontend)
    public Optional<Employee> getById(Long employeeId) {
        return repo.findById(employeeId);
    }
}

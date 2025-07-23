package com.example.payflow_backend.service;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.repository.EmployeeRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public void addEmployee(Employee e) {
        repo.save(e);
    }

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public boolean existsByEmail(String email) {
        return repo.existsByEmail(email);
    }

    public Employee login(String email, String rawPassword) {
        Optional<Employee> empOpt = repo.findByEmail(email);
        if (empOpt.isEmpty()) return null;

        Employee emp = empOpt.get();
        if (passwordEncoder.matches(rawPassword, emp.getPasswordHash())) {
            return emp;
        }
        return null;
    }

    public Collection<? extends GrantedAuthority> getAuthorities(Employee emp) {
        return List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")); // or emp.getRole() if dynamic
    }

}

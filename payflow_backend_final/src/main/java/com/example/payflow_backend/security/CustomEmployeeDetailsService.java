package com.example.payflow_backend.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.repository.EmployeeRepository;

@Service
public class CustomEmployeeDetailsService implements UserDetailsService {
    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));
        return new org.springframework.security.core.userdetails.User(
                employee.getEmail(),
                employee.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))
        );
    }
}


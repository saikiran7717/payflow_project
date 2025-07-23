package com.example.payflow_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.payflow_backend.model.PasswordReset;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
}

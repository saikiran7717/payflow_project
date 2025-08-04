package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
}

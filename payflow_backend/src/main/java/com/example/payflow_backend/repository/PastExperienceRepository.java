package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.PastExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PastExperienceRepository extends JpaRepository<PastExperience, Long> {
    List<PastExperience> findByEmployee_EmployeeId(Long employeeId);
}

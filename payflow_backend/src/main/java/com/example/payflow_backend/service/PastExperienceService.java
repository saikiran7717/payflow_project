package com.example.payflow_backend.service;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.PastExperience;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.PastExperienceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PastExperienceService {

    private final PastExperienceRepository pastExperienceRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public PastExperienceService(PastExperienceRepository pastExperienceRepository,
                                 EmployeeRepository employeeRepository) {
        this.pastExperienceRepository = pastExperienceRepository;
        this.employeeRepository = employeeRepository;
    }

    public PastExperience saveExperience(PastExperience experience, Long employeeId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new IllegalArgumentException("Employee not found with ID: " + employeeId);
        }

        experience.setEmployee(employeeOpt.get());
        return pastExperienceRepository.save(experience);
    }

    public List<PastExperience> saveAllExperiences(List<PastExperience> experiences, Long employeeId) {
        if (experiences == null || experiences.isEmpty()) {
            return Collections.emptyList();
        }

        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new IllegalArgumentException("Employee not found with ID: " + employeeId);
        }

        Employee employee = employeeOpt.get();
        experiences.forEach(exp -> exp.setEmployee(employee));
        return pastExperienceRepository.saveAll(experiences);
    }

    public List<PastExperience> getExperiencesByEmployeeId(Long employeeId) {
        return pastExperienceRepository.findByEmployee_EmployeeId(employeeId);
    }

    public PastExperience updateExperience(Long experienceId, PastExperience updatedData) {
        PastExperience existing = pastExperienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Experience not found with ID: " + experienceId));

        existing.setCompanyName(updatedData.getCompanyName());
        existing.setRole(updatedData.getRole());
        existing.setYearsOfExperience(updatedData.getYearsOfExperience());
        existing.setLocation(updatedData.getLocation());

        return pastExperienceRepository.save(existing);
    }

    public void deleteExperience(Long experienceId) {
        pastExperienceRepository.deleteById(experienceId);
    }
}

package com.example.payflow_backend.service;

import com.example.payflow_backend.model.CTC;
import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.repository.CTCRepository;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.service.CTCHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CTCService {

    @Autowired
    private CTCRepository ctcRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CTCHistoryService ctcHistoryService;

    /**
     * Create a new CTC record for an employee
     */
    public CTC createCTC(Long employeeId, CTC ctc) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            throw new RuntimeException("Employee not found with ID: " + employeeId);
        }

        Employee employee = employeeOpt.get();
        ctc.setEmployee(employee);
        
        // Set creation timestamp if not already set
        if (ctc.getCreatedAt() == null) {
            ctc.setCreatedAt(LocalDateTime.now());
        }

        CTC savedCTC = ctcRepository.save(ctc);
        
        // Save CTC history record for audit trail
        ctcHistoryService.saveCTCCreated(savedCTC, "system"); // TODO: Replace with actual user context
        
        return savedCTC;
    }

    /**
     * Update an existing CTC record
     */
    public CTC updateCTC(Long ctcId, CTC updatedCTC) {
        Optional<CTC> existingCTCOpt = ctcRepository.findById(ctcId);
        if (existingCTCOpt.isEmpty()) {
            throw new RuntimeException("CTC record not found with ID: " + ctcId);
        }

        CTC existingCTC = existingCTCOpt.get();
        
        // Update fields
        existingCTC.setEffectiveFrom(updatedCTC.getEffectiveFrom());
        existingCTC.setBasicSalary(updatedCTC.getBasicSalary());
        existingCTC.setAllowances(updatedCTC.getAllowances());
        existingCTC.setBonuses(updatedCTC.getBonuses());
        existingCTC.setPfContribution(updatedCTC.getPfContribution());
        existingCTC.setGratuity(updatedCTC.getGratuity());
        existingCTC.setTotalCtc(updatedCTC.getTotalCtc());
        existingCTC.setUpdatedAt(LocalDateTime.now());

        CTC savedCTC = ctcRepository.save(existingCTC);
        
        // Save CTC history record for audit trail
        ctcHistoryService.saveCTCUpdated(savedCTC, "system"); // TODO: Replace with actual user context
        
        return savedCTC;
    }

    /**
     * Get all CTC records for an employee
     */
    public List<CTC> getCTCByEmployeeId(Long employeeId) {
        return ctcRepository.findByEmployee_EmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    /**
     * Get current active CTC for an employee
     */
    public Optional<CTC> getCurrentCTCByEmployeeId(Long employeeId) {
        return ctcRepository.findCurrentCTCByEmployeeId(employeeId, LocalDate.now());
    }

    /**
     * Get the latest CTC record for an employee (regardless of effective date)
     */
    public Optional<CTC> getLatestCTCByEmployeeId(Long employeeId) {
        return ctcRepository.findTopByEmployee_EmployeeIdOrderByEffectiveFromDesc(employeeId);
    }

    /**
     * Delete a CTC record (use with caution)
     */
    public void deleteCTC(Long ctcId) {
        if (!ctcRepository.existsById(ctcId)) {
            throw new RuntimeException("CTC record not found with ID: " + ctcId);
        }
        
        // Get the CTC before deleting for history purposes
        Optional<CTC> ctcOpt = ctcRepository.findById(ctcId);
        if (ctcOpt.isPresent()) {
            CTC ctc = ctcOpt.get();
            // Save deletion history before actual deletion
            ctcHistoryService.saveCTCDeactivated(ctc, "system"); // TODO: Replace with actual user context
        }
        
        ctcRepository.deleteById(ctcId);
    }

    /**
     * Get all CTC records
     */
    public List<CTC> getAllCTC() {
        return ctcRepository.findAllByOrderByEffectiveFromDesc();
    }

    /**
     * Calculate monthly salary for an employee
     */
    public BigDecimal getMonthlySlaryByEmployeeId(Long employeeId) {
        Optional<CTC> currentCTC = getCurrentCTCByEmployeeId(employeeId);
        return currentCTC.map(CTC::getMonthlySalary).orElse(BigDecimal.ZERO);
    }

    /**
     * Calculate net monthly salary for an employee (after PF deduction)
     */
    public BigDecimal getNetMonthlySalaryByEmployeeId(Long employeeId) {
        Optional<CTC> currentCTC = getCurrentCTCByEmployeeId(employeeId);
        return currentCTC.map(CTC::getNetMonthlySalary).orElse(BigDecimal.ZERO);
    }

    /**
     * Check if an employee has any CTC records
     */
    public boolean hasCTC(Long employeeId) {
        return ctcRepository.existsByEmployee_EmployeeId(employeeId);
    }

    /**
     * Create a salary revision (new CTC record with future effective date)
     */
    public CTC createSalaryRevision(Long employeeId, CTC newCTC, LocalDate effectiveFrom) {
        // Validate that the effective date is in the future
        if (effectiveFrom.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Effective date must be in the future for salary revision");
        }

        newCTC.setEffectiveFrom(effectiveFrom);
        CTC revisionCTC = createCTC(employeeId, newCTC);
        
        // Add additional history entry specifically for salary revision
        ctcHistoryService.saveCTCRevision(revisionCTC, "system", "Salary revision with future effective date"); // TODO: Replace with actual user context
        
        return revisionCTC;
    }

    /**
     * Get CTC records within a salary range
     */
    public List<CTC> getCTCBySalaryRange(BigDecimal minSalary, BigDecimal maxSalary) {
        return ctcRepository.findByTotalCtcBetween(minSalary, maxSalary);
    }
}

package com.example.payflow_backend.service;

import com.example.payflow_backend.model.*;
import com.example.payflow_backend.repository.PayrollRepository;
import com.example.payflow_backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CTCService ctcService;

    /**
     * Generate payroll for a specific employee and month
     */
    public Payroll generatePayrollForEmployee(Long employeeId, String month) {
        // Check if payroll already exists for this employee and month
        if (payrollRepository.existsByEmployee_EmployeeIdAndMonth(employeeId, month)) {
            throw new IllegalArgumentException("Payroll already exists for employee " + employeeId + " for month " + month);
        }

        // Get employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        // Get current CTC for the employee
        BigDecimal netMonthlySalary = ctcService.getNetMonthlySalaryByEmployeeId(employeeId);
        if (netMonthlySalary.equals(BigDecimal.ZERO)) {
            throw new IllegalArgumentException("No CTC found for employee " + employeeId);
        }

        // Calculate payroll
        return calculateAndSavePayroll(employee, month, netMonthlySalary);
    }

    /**
     * Generate payroll for all employees for a specific month
     */
    public List<Payroll> generatePayrollForAllEmployees(String month) {
        List<Employee> allEmployees = employeeRepository.findAll();
        return allEmployees.stream()
                .filter(Employee::getIsActive) // Only process active employees
                .filter(emp -> ctcService.hasCTC(emp.getEmployeeId())) // Only employees with CTC
                .filter(emp -> !payrollRepository.existsByEmployee_EmployeeIdAndMonth(emp.getEmployeeId(), month)) // Avoid duplicates
                .map(employee -> {
                    try {
                        BigDecimal netMonthlySalary = ctcService.getNetMonthlySalaryByEmployeeId(employee.getEmployeeId());
                        return calculateAndSavePayroll(employee, month, netMonthlySalary);
                    } catch (Exception e) {
                        System.err.println("Error generating payroll for employee " + employee.getEmployeeId() + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    /**
     * Generate payroll for previous month automatically
     */
    public List<Payroll> generatePayrollForPreviousMonth() {
        YearMonth previousMonth = YearMonth.now().minusMonths(1);
        String monthStr = previousMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return generatePayrollForAllEmployees(monthStr);
    }

    /**
     * Calculate and save payroll for an employee
     */
    private Payroll calculateAndSavePayroll(Employee employee, String month, BigDecimal grossSalary) {
        // Parse month to get total working days
        YearMonth yearMonth = YearMonth.parse(month);
        int totalWorkingDays = yearMonth.lengthOfMonth();

        // Get unpaid leaves (extraLeavesThisMonth from employee)
        int unpaidLeaves = employee.getExtraLeavesThisMonth();

        // Calculate per day salary
        BigDecimal perDaySalary = grossSalary.divide(BigDecimal.valueOf(totalWorkingDays), 2, RoundingMode.HALF_UP);

        // Calculate leave deduction
        BigDecimal leaveDeduction = perDaySalary.multiply(BigDecimal.valueOf(unpaidLeaves));

        // Calculate net salary
        BigDecimal netSalary = grossSalary.subtract(leaveDeduction);

        // Ensure net salary is not negative
        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            netSalary = BigDecimal.ZERO;
        }

        // Create payroll record
        Payroll payroll = Payroll.builder()
                .employee(employee)
                .month(month)
                .grossSalary(grossSalary)
                .leaveDeduction(leaveDeduction)
                .netSalary(netSalary)
                .totalWorkingDays(totalWorkingDays)
                .unpaidLeaves(unpaidLeaves)
                .perDaySalary(perDaySalary)
                .status(PayrollStatus.PROCESSED)
                .processedBy("system") // TODO: Get from security context
                .build();

        return payrollRepository.save(payroll);
    }

    /**
     * Get payroll by ID
     */
    public Optional<Payroll> getPayrollById(Long id) {
        return payrollRepository.findById(id);
    }

    /**
     * Get payroll for specific employee and month
     */
    public Optional<Payroll> getPayrollByEmployeeAndMonth(Long employeeId, String month) {
        return payrollRepository.findByEmployee_EmployeeIdAndMonth(employeeId, month);
    }

    /**
     * Get all payroll records for an employee
     */
    public List<Payroll> getPayrollByEmployee(Long employeeId) {
        return payrollRepository.findByEmployee_EmployeeIdOrderByMonthDesc(employeeId);
    }

    /**
     * Get all payroll records for a specific month
     */
    public List<Payroll> getPayrollByMonth(String month) {
        return payrollRepository.findByMonth(month);
    }

    /**
     * Get all payroll records
     */
    public List<Payroll> getAllPayroll() {
        return payrollRepository.findAll();
    }

    /**
     * Update payroll status
     */
    public Payroll updatePayrollStatus(Long payrollId, PayrollStatus status) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found with ID: " + payrollId));
        
        payroll.setStatus(status);
        return payrollRepository.save(payroll);
    }

    /**
     * Delete payroll record
     */
    public void deletePayroll(Long payrollId) {
        if (!payrollRepository.existsById(payrollId)) {
            throw new RuntimeException("Payroll not found with ID: " + payrollId);
        }
        payrollRepository.deleteById(payrollId);
    }

    /**
     * Regenerate payroll for specific employee and month (replaces existing)
     */
    public Payroll regeneratePayrollForEmployee(Long employeeId, String month) {
        // Delete existing payroll if exists
        Optional<Payroll> existingPayroll = payrollRepository.findByEmployee_EmployeeIdAndMonth(employeeId, month);
        existingPayroll.ifPresent(payroll -> payrollRepository.delete(payroll));

        // Generate new payroll
        return generatePayrollForEmployee(employeeId, month);
    }

    /**
     * Get payroll summary statistics for a month
     */
    public PayrollSummary getPayrollSummaryForMonth(String month) {
        List<Payroll> payrolls = payrollRepository.findByMonth(month);
        
        BigDecimal totalGrossSalary = payrolls.stream()
                .map(Payroll::getGrossSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalLeaveDeductions = payrolls.stream()
                .map(Payroll::getLeaveDeduction)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalNetSalary = payrolls.stream()
                .map(Payroll::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalEmployees = payrolls.size();
        int totalUnpaidLeaves = payrolls.stream()
                .mapToInt(Payroll::getUnpaidLeaves)
                .sum();

        return PayrollSummary.builder()
                .month(month)
                .totalEmployees(totalEmployees)
                .totalGrossSalary(totalGrossSalary)
                .totalLeaveDeductions(totalLeaveDeductions)
                .totalNetSalary(totalNetSalary)
                .totalUnpaidLeaves(totalUnpaidLeaves)
                .build();
    }

    // Inner class for payroll summary
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PayrollSummary {
        private String month;
        private int totalEmployees;
        private BigDecimal totalGrossSalary;
        private BigDecimal totalLeaveDeductions;
        private BigDecimal totalNetSalary;
        private int totalUnpaidLeaves;
    }
}

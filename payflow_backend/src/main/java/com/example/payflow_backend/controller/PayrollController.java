package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.Payroll;
import com.example.payflow_backend.model.PayrollStatus;
import com.example.payflow_backend.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    /**
     * Generate payroll for a specific employee and month
     */
    @PostMapping("/generate/employee/{employeeId}")
    public ResponseEntity<?> generatePayrollForEmployee(
            @PathVariable Long employeeId,
            @RequestParam String month) {
        try {
            Payroll payroll = payrollService.generatePayrollForEmployee(employeeId, month);
            return ResponseEntity.status(HttpStatus.CREATED).body(payroll);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate payroll: " + e.getMessage()));
        }
    }

    /**
     * Generate payroll for all employees for a specific month
     */
    @PostMapping("/generate/all")
    public ResponseEntity<?> generatePayrollForAllEmployees(@RequestParam String month) {
        try {
            List<Payroll> payrolls = payrollService.generatePayrollForAllEmployees(month);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Payroll generated successfully",
                    "month", month,
                    "employeesProcessed", payrolls.size(),
                    "payrolls", payrolls
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate payroll for all employees: " + e.getMessage()));
        }
    }

    /**
     * Generate payroll for previous month (automatic monthly processing)
     */
    @PostMapping("/generate/previous-month")
    public ResponseEntity<?> generatePayrollForPreviousMonth() {
        try {
            List<Payroll> payrolls = payrollService.generatePayrollForPreviousMonth();
            YearMonth previousMonth = YearMonth.now().minusMonths(1);
            String monthStr = previousMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Payroll generated for previous month",
                    "month", monthStr,
                    "employeesProcessed", payrolls.size(),
                    "payrolls", payrolls
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate payroll for previous month: " + e.getMessage()));
        }
    }

    /**
     * Get payroll by ID
     */
    @GetMapping("/{payrollId}")
    public ResponseEntity<?> getPayrollById(@PathVariable Long payrollId) {
        Optional<Payroll> payroll = payrollService.getPayrollById(payrollId);
        if (payroll.isPresent()) {
            return ResponseEntity.ok(payroll.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Payroll not found with ID: " + payrollId));
        }
    }

    /**
     * Get payroll for specific employee and month
     */
    @GetMapping("/employee/{employeeId}/month/{month}")
    public ResponseEntity<?> getPayrollByEmployeeAndMonth(
            @PathVariable Long employeeId,
            @PathVariable String month) {
        Optional<Payroll> payroll = payrollService.getPayrollByEmployeeAndMonth(employeeId, month);
        if (payroll.isPresent()) {
            return ResponseEntity.ok(payroll.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Payroll not found for employee " + employeeId + " for month " + month));
        }
    }

    /**
     * Get all payroll records for an employee
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollByEmployee(@PathVariable Long employeeId) {
        List<Payroll> payrolls = payrollService.getPayrollByEmployee(employeeId);
        return ResponseEntity.ok(payrolls);
    }

    /**
     * Get all payroll records for a specific month
     */
    @GetMapping("/month/{month}")
    public ResponseEntity<List<Payroll>> getPayrollByMonth(@PathVariable String month) {
        List<Payroll> payrolls = payrollService.getPayrollByMonth(month);
        return ResponseEntity.ok(payrolls);
    }

    /**
     * Get all payroll records
     */
    @GetMapping("/all")
    public ResponseEntity<List<Payroll>> getAllPayroll() {
        List<Payroll> payrolls = payrollService.getAllPayroll();
        return ResponseEntity.ok(payrolls);
    }

    /**
     * Update payroll status
     */
    @PutMapping("/{payrollId}/status")
    public ResponseEntity<?> updatePayrollStatus(
            @PathVariable Long payrollId,
            @RequestParam PayrollStatus status) {
        try {
            Payroll updatedPayroll = payrollService.updatePayrollStatus(payrollId, status);
            return ResponseEntity.ok(updatedPayroll);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete payroll record
     */
    @DeleteMapping("/{payrollId}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long payrollId) {
        try {
            payrollService.deletePayroll(payrollId);
            return ResponseEntity.ok(Map.of("message", "Payroll deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Regenerate payroll for specific employee and month
     */
    @PostMapping("/regenerate/employee/{employeeId}")
    public ResponseEntity<?> regeneratePayrollForEmployee(
            @PathVariable Long employeeId,
            @RequestParam String month) {
        try {
            Payroll payroll = payrollService.regeneratePayrollForEmployee(employeeId, month);
            return ResponseEntity.ok(Map.of(
                    "message", "Payroll regenerated successfully",
                    "payroll", payroll
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to regenerate payroll: " + e.getMessage()));
        }
    }

    /**
     * Get payroll summary for a month
     */
    @GetMapping("/summary/month/{month}")
    public ResponseEntity<PayrollService.PayrollSummary> getPayrollSummaryForMonth(@PathVariable String month) {
        PayrollService.PayrollSummary summary = payrollService.getPayrollSummaryForMonth(month);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get current month for payroll processing
     */
    @GetMapping("/current-month")
    public ResponseEntity<?> getCurrentMonth() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        
        return ResponseEntity.ok(Map.of(
                "currentMonth", currentMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")),
                "previousMonth", previousMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"))
        ));
    }
}

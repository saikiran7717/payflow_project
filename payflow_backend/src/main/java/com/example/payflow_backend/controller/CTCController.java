package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.CTC;
import com.example.payflow_backend.model.CTCHistory;
import com.example.payflow_backend.service.CTCService;
import com.example.payflow_backend.service.CTCHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ctc")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CTCController {

    @Autowired
    private CTCService ctcService;

    @Autowired
    private CTCHistoryService ctcHistoryService;

    /**
     * Create a new CTC record for an employee
     */
    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<?> createCTC(@PathVariable Long employeeId, @RequestBody CTC ctc) {
        try {
            CTC createdCTC = ctcService.createCTC(employeeId, ctc);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCTC);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing CTC record
     */
    @PutMapping("/{ctcId}")
    public ResponseEntity<?> updateCTC(@PathVariable Long ctcId, @RequestBody CTC ctc) {
        try {
            CTC updatedCTC = ctcService.updateCTC(ctcId, ctc);
            return ResponseEntity.ok(updatedCTC);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all CTC records for an employee
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<CTC>> getCTCByEmployeeId(@PathVariable Long employeeId) {
        List<CTC> ctcRecords = ctcService.getCTCByEmployeeId(employeeId);
        return ResponseEntity.ok(ctcRecords);
    }

    /**
     * Get current active CTC for an employee
     */
    @GetMapping("/employee/{employeeId}/current")
    public ResponseEntity<?> getCurrentCTCByEmployeeId(@PathVariable Long employeeId) {
        Optional<CTC> currentCTC = ctcService.getCurrentCTCByEmployeeId(employeeId);
        if (currentCTC.isPresent()) {
            return ResponseEntity.ok(currentCTC.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No active CTC found for employee ID: " + employeeId));
        }
    }

    /**
     * Get CTC history for an employee
     */
    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<CTCHistory>> getCTCHistoryByEmployeeId(@PathVariable Long employeeId) {
        List<CTCHistory> ctcHistory = ctcHistoryService.getCTCHistoryByEmployeeId(employeeId);
        return ResponseEntity.ok(ctcHistory);
    }

    /**
     * Get the latest CTC record for an employee
     */
    @GetMapping("/employee/{employeeId}/latest")
    public ResponseEntity<?> getLatestCTCByEmployeeId(@PathVariable Long employeeId) {
        Optional<CTC> latestCTC = ctcService.getLatestCTCByEmployeeId(employeeId);
        if (latestCTC.isPresent()) {
            return ResponseEntity.ok(latestCTC.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No CTC records found for employee ID: " + employeeId));
        }
    }

    /**
     * Get monthly salary for an employee
     */
    @GetMapping("/employee/{employeeId}/monthly-salary")
    public ResponseEntity<?> getMonthlySalary(@PathVariable Long employeeId) {
        BigDecimal monthlySalary = ctcService.getMonthlySlaryByEmployeeId(employeeId);
        return ResponseEntity.ok(Map.of(
                "employeeId", employeeId,
                "monthlySalary", monthlySalary
        ));
    }

    /**
     * Get net monthly salary for an employee
     */
    @GetMapping("/employee/{employeeId}/net-monthly-salary")
    public ResponseEntity<?> getNetMonthlySalary(@PathVariable Long employeeId) {
        BigDecimal netMonthlySalary = ctcService.getNetMonthlySalaryByEmployeeId(employeeId);
        return ResponseEntity.ok(Map.of(
                "employeeId", employeeId,
                "netMonthlySalary", netMonthlySalary
        ));
    }

    /**
     * Get all CTC records
     */
    @GetMapping("/all")
    public ResponseEntity<List<CTC>> getAllCTC() {
        List<CTC> ctcRecords = ctcService.getAllCTC();
        return ResponseEntity.ok(ctcRecords);
    }

    /**
     * Create a salary revision
     */
    @PostMapping("/employee/{employeeId}/revision")
    public ResponseEntity<?> createSalaryRevision(
            @PathVariable Long employeeId,
            @RequestBody CTC ctc,
            @RequestParam("effectiveFrom") String effectiveFromStr) {
        try {
            LocalDate effectiveFrom = LocalDate.parse(effectiveFromStr);
            CTC revision = ctcService.createSalaryRevision(employeeId, ctc, effectiveFrom);
            return ResponseEntity.status(HttpStatus.CREATED).body(revision);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get CTC records within a salary range
     */
    @GetMapping("/salary-range")
    public ResponseEntity<List<CTC>> getCTCBySalaryRange(
            @RequestParam BigDecimal minSalary,
            @RequestParam BigDecimal maxSalary) {
        List<CTC> ctcRecords = ctcService.getCTCBySalaryRange(minSalary, maxSalary);
        return ResponseEntity.ok(ctcRecords);
    }

    /**
     * Check if employee has CTC
     */
    @GetMapping("/employee/{employeeId}/has-ctc")
    public ResponseEntity<?> hasCTC(@PathVariable Long employeeId) {
        boolean hasCTC = ctcService.hasCTC(employeeId);
        return ResponseEntity.ok(Map.of(
                "employeeId", employeeId,
                "hasCTC", hasCTC
        ));
    }

    /**
     * Delete a CTC record (use with caution)
     */
    @DeleteMapping("/{ctcId}")
    public ResponseEntity<?> deleteCTC(@PathVariable Long ctcId) {
        try {
            ctcService.deleteCTC(ctcId);
            return ResponseEntity.ok(Map.of("message", "CTC record deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

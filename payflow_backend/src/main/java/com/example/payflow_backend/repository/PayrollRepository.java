package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    // Find payroll by employee ID and month
    Optional<Payroll> findByEmployee_EmployeeIdAndMonth(Long employeeId, String month);
    
    // Find all payroll records for an employee
    List<Payroll> findByEmployee_EmployeeIdOrderByMonthDesc(Long employeeId);
    
    // Find all payroll records for a specific month
    List<Payroll> findByMonth(String month);
    
    // Find all payroll records for a specific month and status
    List<Payroll> findByMonthAndStatus(String month, com.example.payflow_backend.model.PayrollStatus status);
    
    // Check if payroll exists for employee and month
    boolean existsByEmployee_EmployeeIdAndMonth(Long employeeId, String month);
    
    // Get payroll records for a date range
    @Query("SELECT p FROM Payroll p WHERE p.month BETWEEN :startMonth AND :endMonth ORDER BY p.month DESC")
    List<Payroll> findByMonthRange(@Param("startMonth") String startMonth, @Param("endMonth") String endMonth);
    
    // Get latest payroll record for each employee
    @Query("SELECT p FROM Payroll p WHERE p.month = (SELECT MAX(p2.month) FROM Payroll p2 WHERE p2.employee.employeeId = p.employee.employeeId) ORDER BY p.employee.employeeId")
    List<Payroll> findLatestPayrollForAllEmployees();
    
    // Find payroll records that need processing (PENDING status)
    List<Payroll> findByStatus(com.example.payflow_backend.model.PayrollStatus status);
}

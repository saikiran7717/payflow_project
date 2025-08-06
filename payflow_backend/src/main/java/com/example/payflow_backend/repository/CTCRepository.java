package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.CTC;
import com.example.payflow_backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CTCRepository extends JpaRepository<CTC, Long> {

    // Find all CTC records for a specific employee
    List<CTC> findByEmployeeOrderByEffectiveFromDesc(Employee employee);

    // Find all CTC records for a specific employee by ID
    List<CTC> findByEmployee_EmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    // Find the current CTC for an employee (most recent effective date that's not in the future)
    @Query("SELECT c FROM CTC c WHERE c.employee.employeeId = :employeeId AND c.effectiveFrom <= :currentDate ORDER BY c.effectiveFrom DESC")
    Optional<CTC> findCurrentCTCByEmployeeId(@Param("employeeId") Long employeeId, @Param("currentDate") LocalDate currentDate);

    // Find the latest CTC record for an employee (regardless of effective date)
    Optional<CTC> findTopByEmployee_EmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    // Find all CTC records ordered by effective date
    List<CTC> findAllByOrderByEffectiveFromDesc();

    // Find CTC records effective from a specific date
    List<CTC> findByEffectiveFrom(LocalDate effectiveFrom);

    // Find CTC records within a date range
    @Query("SELECT c FROM CTC c WHERE c.effectiveFrom BETWEEN :startDate AND :endDate ORDER BY c.effectiveFrom DESC")
    List<CTC> findByEffectiveFromBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Check if an employee has any CTC records
    boolean existsByEmployee_EmployeeId(Long employeeId);

    // Find CTC records by salary range
    @Query("SELECT c FROM CTC c WHERE c.totalCtc BETWEEN :minSalary AND :maxSalary ORDER BY c.totalCtc DESC")
    List<CTC> findByTotalCtcBetween(@Param("minSalary") java.math.BigDecimal minSalary, @Param("maxSalary") java.math.BigDecimal maxSalary);
}

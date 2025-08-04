package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByManager(User manager);
    List<Employee> findByManagerUserIdAndIsActiveTrue(Long managerId);
    
    /**
     * Reset extraLeavesThisMonth to 0 for all employees
     * Used by the monthly scheduled service to reset extra leaves counter
     * @return number of employees updated
     */
    @Modifying
    @Query("UPDATE Employee e SET e.extraLeavesThisMonth = 0")
    int resetExtraLeavesForAllEmployees();
}

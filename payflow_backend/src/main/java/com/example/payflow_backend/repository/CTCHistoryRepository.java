package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.CTCHistory;
import com.example.payflow_backend.model.CTCHistory.CTCActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CTCHistoryRepository extends JpaRepository<CTCHistory, Long> {

    /**
     * Find all CTC history records for a specific employee
     */
    List<CTCHistory> findByEmployeeEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    /**
     * Find CTC history by CTC ID
     */
    List<CTCHistory> findByCtcCtcIdOrderByCreatedAtDesc(Long ctcId);

    /**
     * Find CTC history by action type
     */
    List<CTCHistory> findByActionTypeOrderByCreatedAtDesc(CTCActionType actionType);

    /**
     * Find CTC history for an employee within a date range
     */
    @Query("SELECT ch FROM CTCHistory ch WHERE ch.employee.employeeId = :employeeId " +
           "AND ch.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY ch.createdAt DESC")
    List<CTCHistory> findByEmployeeIdAndDateRange(@Param("employeeId") Long employeeId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Find latest CTC history record for an employee
     */
    @Query("SELECT ch FROM CTCHistory ch WHERE ch.employee.employeeId = :employeeId " +
           "ORDER BY ch.createdAt DESC LIMIT 1")
    CTCHistory findLatestByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Count CTC changes for an employee
     */
    long countByEmployeeEmployeeId(Long employeeId);

    /**
     * Find CTC history by created by (user who made the change)
     */
    List<CTCHistory> findByCreatedByOrderByCreatedAtDesc(String createdBy);
}

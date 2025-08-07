package com.example.payflow_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"payrollRecords", "ctcDetails", "pastExperiences", "hibernateLazyInitializer", "handler"})
    private Employee employee;

    @Column(name = "month", nullable = false, length = 7) // Format: YYYY-MM
    private String month;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "leave_deduction", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal leaveDeduction = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Additional fields for detailed payroll information
    @Column(name = "total_working_days", nullable = false)
    private Integer totalWorkingDays;

    @Column(name = "unpaid_leaves", nullable = false)
    @Builder.Default
    private Integer unpaidLeaves = 0;

    @Column(name = "per_day_salary", precision = 12, scale = 2)
    private BigDecimal perDaySalary;

    @Column(name = "processed_by")
    private String processedBy; // Username of who processed the payroll

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.PENDING;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

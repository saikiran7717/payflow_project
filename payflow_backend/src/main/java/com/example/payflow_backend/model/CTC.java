package com.example.payflow_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ctc_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CTC {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ctc_id")
    private Long ctcId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private Employee employee;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "basic_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "allowances", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal allowances = BigDecimal.ZERO;

    @Column(name = "bonuses", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal bonuses = BigDecimal.ZERO;

    @Column(name = "pf_contribution", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pfContribution = BigDecimal.ZERO;

    @Column(name = "gratuity", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal gratuity = BigDecimal.ZERO;

    @Column(name = "total_ctc", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCtc;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        
        // Calculate total CTC if not provided
        if (totalCtc == null) {
            calculateTotalCtc();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Recalculate total CTC on update
        calculateTotalCtc();
    }

    // Helper method to calculate total CTC
    private void calculateTotalCtc() {
        BigDecimal total = basicSalary != null ? basicSalary : BigDecimal.ZERO;
        if (allowances != null) total = total.add(allowances);
        if (bonuses != null) total = total.add(bonuses);
        if (pfContribution != null) total = total.add(pfContribution);
        if (gratuity != null) total = total.add(gratuity);
        
        this.totalCtc = total;
    }

    // Utility method to get monthly salary (total CTC / 12)
    public BigDecimal getMonthlySalary() {
        if (totalCtc != null) {
            return totalCtc.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    // Utility method to get net monthly salary (after PF deduction and gratuity)
    public BigDecimal getNetMonthlySalary() {
        BigDecimal monthly = getMonthlySalary();
        if (pfContribution != null) {
            BigDecimal monthlyPf = pfContribution.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            monthly = monthly.subtract(monthlyPf);
        }
        if(gratuity != null) {
            BigDecimal monthlyGratuity = gratuity.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            monthly = monthly.subtract(monthlyGratuity);
        }
        return monthly;
    }
}

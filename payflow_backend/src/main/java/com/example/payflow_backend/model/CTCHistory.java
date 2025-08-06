package com.example.payflow_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ctc_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CTCHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ctc_history_id")
    private Long ctcHistoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ctc_id", nullable = false)
    @JsonBackReference
    private CTC ctc;

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

    @Column(name = "monthly_salary", precision = 12, scale = 2)
    private BigDecimal monthlySalary;

    @Column(name = "net_monthly_salary", precision = 12, scale = 2)
    private BigDecimal netMonthlySalary;

    @Column(name = "action_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private CTCActionType actionType;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "remarks")
    private String remarks;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Static factory method to create CTCHistory from CTC
    public static CTCHistory fromCTC(CTC ctc, CTCActionType actionType, String createdBy, String remarks) {
        return CTCHistory.builder()
                .employee(ctc.getEmployee())
                .ctc(ctc)
                .effectiveFrom(ctc.getEffectiveFrom())
                .basicSalary(ctc.getBasicSalary())
                .allowances(ctc.getAllowances())
                .bonuses(ctc.getBonuses())
                .pfContribution(ctc.getPfContribution())
                .gratuity(ctc.getGratuity())
                .totalCtc(ctc.getTotalCtc())
                .monthlySalary(ctc.getMonthlySalary())
                .netMonthlySalary(ctc.getNetMonthlySalary())
                .actionType(actionType)
                .createdBy(createdBy)
                .remarks(remarks)
                .build();
    }

    // Enum for action types
    public enum CTCActionType {
        CREATED,
        UPDATED,
        DEACTIVATED,
        REVISION
    }
}

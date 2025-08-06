package com.example.payflow_backend.dto;

import com.example.payflow_backend.model.CTC;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CTCResponse {
    
    private Long ctcId;
    private Long employeeId;
    private String employeeName;
    private LocalDate effectiveFrom;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal bonuses;
    private BigDecimal pfContribution;
    private BigDecimal gratuity;
    private BigDecimal totalCtc;
    private BigDecimal monthlySalary;
    private BigDecimal netMonthlySalary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor from CTC entity
    public static CTCResponse fromEntity(CTC ctc) {
        return CTCResponse.builder()
                .ctcId(ctc.getCtcId())
                .employeeId(ctc.getEmployee().getEmployeeId())
                .employeeName(ctc.getEmployee().getFullName())
                .effectiveFrom(ctc.getEffectiveFrom())
                .basicSalary(ctc.getBasicSalary())
                .allowances(ctc.getAllowances())
                .bonuses(ctc.getBonuses())
                .pfContribution(ctc.getPfContribution())
                .gratuity(ctc.getGratuity())
                .totalCtc(ctc.getTotalCtc())
                .monthlySalary(ctc.getMonthlySalary())
                .netMonthlySalary(ctc.getNetMonthlySalary())
                .createdAt(ctc.getCreatedAt())
                .updatedAt(ctc.getUpdatedAt())
                .build();
    }
}

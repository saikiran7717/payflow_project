package com.example.payflow_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CTCRequest {
    
    private LocalDate effectiveFrom;
    
    private BigDecimal basicSalary;
    
    private BigDecimal allowances;
    
    private BigDecimal bonuses;
    
    private BigDecimal pfContribution;
    
    private BigDecimal gratuity;
    
    private BigDecimal totalCtc;

    // Validation helper methods
    public boolean isValidBasicSalary() {
        return basicSalary != null && basicSalary.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isValidEffectiveDate() {
        return effectiveFrom != null;
    }

    public boolean isValidTotalCtc() {
        return totalCtc != null && totalCtc.compareTo(BigDecimal.ZERO) > 0;
    }

    // Auto-calculate total CTC if not provided
    public BigDecimal calculateTotalCtc() {
        BigDecimal total = basicSalary != null ? basicSalary : BigDecimal.ZERO;
        
        if (allowances != null) total = total.add(allowances);
        if (bonuses != null) total = total.add(bonuses);
        if (pfContribution != null) total = total.add(pfContribution);
        if (gratuity != null) total = total.add(gratuity);
        
        return total;
    }

    // Set default values for null fields
    public void setDefaults() {
        if (allowances == null) allowances = BigDecimal.ZERO;
        if (bonuses == null) bonuses = BigDecimal.ZERO;
        if (pfContribution == null) pfContribution = BigDecimal.ZERO;
        if (gratuity == null) gratuity = BigDecimal.ZERO;
        if (effectiveFrom == null) effectiveFrom = LocalDate.now();
        if (totalCtc == null) totalCtc = calculateTotalCtc();
    }
}

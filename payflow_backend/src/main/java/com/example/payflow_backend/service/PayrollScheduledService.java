package com.example.payflow_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PayrollScheduledService {

    private static final Logger logger = LoggerFactory.getLogger(PayrollScheduledService.class);

    @Autowired
    private PayrollService payrollService;

    /**
     * Scheduled task to generate payroll for all employees
     * Runs on the last day of every month at 11:30 PM
     * Cron expression: "0 30 23 L * ?" means:
     * - 0 seconds
     * - 59 minutes
     * - 23 hour (11 PM)
     * - L (last day of month)
     * - every month (*)
     * - any day of week (?)
     */
    @Scheduled(cron = "0 59 23 L * ?")
    public void generateMonthlyPayroll() {
        try {
            YearMonth currentMonth = YearMonth.now();
            String monthStr = currentMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            
            logger.info("Starting automatic payroll generation for month: {}", monthStr);
            
            List<com.example.payflow_backend.model.Payroll> payrolls = payrollService.generatePayrollForAllEmployees(monthStr);
            
            logger.info("Successfully generated payroll for {} employees for month: {}", 
                       payrolls.size(), monthStr);
            
        } catch (Exception e) {
            logger.error("Error occurred during automatic payroll generation: {}", e.getMessage(), e);
        }
    }

    /**
     * Manual trigger for testing payroll generation
     * This method can be used for testing - remove @Scheduled annotation in production
     */
    // @Scheduled(fixedRate = 300000) // Runs every 5 minutes - FOR TESTING ONLY
    public void testGeneratePayroll() {
        try {
            YearMonth previousMonth = YearMonth.now().minusMonths(1);
            String monthStr = previousMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            
            logger.info("TEST: Starting payroll generation for month: {}", monthStr);
            
            List<com.example.payflow_backend.model.Payroll> payrolls = payrollService.generatePayrollForAllEmployees(monthStr);
            
            logger.info("TEST: Successfully generated payroll for {} employees for month: {}", 
                       payrolls.size(), monthStr);
            
        } catch (Exception e) {
            logger.error("TEST: Error occurred during payroll generation: {}", e.getMessage(), e);
        }
    }
}

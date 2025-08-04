package com.example.payflow_backend.service;

import com.example.payflow_backend.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class MonthlyResetService {

    private static final Logger logger = LoggerFactory.getLogger(MonthlyResetService.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Scheduled method to reset extraLeavesThisMonth to 0 for all employees
     * Runs on the 1st day of every month at 00:01 (1 minute past midnight)
     * Cron expression: "0 1 0 1 * ?" means:
     * - 0 seconds
     * - 1 minute  
     * - 0 hour (midnight)
     * - 1st day of month
     * - every month (*)
     * - any day of week (?)
     */
    @Scheduled(cron = "0 1 0 1 * ?")
    @Transactional
    public void resetExtraLeavesMonthly() {
        try {
            logger.info("Starting monthly reset of extraLeavesThisMonth field for all employees at {}", 
                       LocalDateTime.now());
            
            // Update all employees' extraLeavesThisMonth to 0
            int updatedCount = employeeRepository.resetExtraLeavesForAllEmployees();
            
            logger.info("Successfully reset extraLeavesThisMonth to 0 for {} employees", updatedCount);
            
        } catch (Exception e) {
            logger.error("Error occurred while resetting extraLeavesThisMonth: {}", e.getMessage(), e);
        }
    }
}

package com.example.payflow_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ScheduledTaskService {

    @Autowired
    private LeaveRequestService leaveRequestService;

    /**
     * Scheduled task to reset extra leaves counter for all employees
     * Runs on the 1st day of every month at 00:01 AM
     * Cron expression: second minute hour day month day-of-week
     */
    @Scheduled(cron = "0 1 0 1 * ?")
    public void resetExtraLeavesMonthly() {
        try {
            leaveRequestService.resetExtraLeavesForNewMonth();
            System.out.println("Monthly reset of extra leaves completed successfully at: " + new java.util.Date());
        } catch (Exception e) {
            System.err.println("Error during monthly extra leaves reset: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Manual trigger for testing - runs every minute (for testing only)
     * Comment out or remove this method in production
     */
    // @Scheduled(fixedRate = 60000) // Runs every 60 seconds - FOR TESTING ONLY
    public void testResetExtraLeaves() {
        System.out.println("Test reset of extra leaves triggered at: " + new java.util.Date());
        // Uncomment the line below to test the reset functionality
        // leaveRequestService.resetExtraLeavesForNewMonth();
    }
}

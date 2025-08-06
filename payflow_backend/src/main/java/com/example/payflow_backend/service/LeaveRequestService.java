package com.example.payflow_backend.service;

import com.example.payflow_backend.model.*;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.LeaveRequestRepository;
import com.example.payflow_backend.exception.InsufficientLeavesException;
import org.springframework.stereotype.Service;
import com.example.payflow_backend.service.EmailService; // Add import


import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.YearMonth;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRepo;
    private final EmployeeRepository employeeRepo;
    private final EmailService emailService; // ✅ Add this

    public LeaveRequestService(LeaveRequestRepository leaveRepo, EmployeeRepository employeeRepo, EmailService emailService) {
        this.leaveRepo = leaveRepo;
        this.employeeRepo = employeeRepo;
        this.emailService = emailService;
    }

    public LeaveRequest applyLeave(Long empId, LeaveRequest leave) {
        Employee emp = employeeRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Calculate the number of days for this leave request
        long leaveDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        
        // Get current month and year
        YearMonth currentYearMonth = YearMonth.now();
        YearMonth leaveStartMonth = YearMonth.from(leave.getStartDate());
        YearMonth leaveEndMonth = YearMonth.from(leave.getEndDate());
        
        // Check if the employee has sufficient remaining leaves
        if (emp.getRemLeaves() < leaveDays) {
            int extraDaysNeeded = (int) (leaveDays - emp.getRemLeaves());
            
            // Check if extra leaves can only be taken in current month
            if (!leaveStartMonth.equals(currentYearMonth) || !leaveEndMonth.equals(currentYearMonth)) {
                throw new InsufficientLeavesException(
                    String.format("Cannot apply for leave: You have %d remaining leaves but requesting %d days. Extra leaves can only be taken within the current month (%s).", 
                                  emp.getRemLeaves(), leaveDays, currentYearMonth.toString()),
                    emp.getRemLeaves(),
                    (int) leaveDays
                );
            }
            
            // If leave is within current month, allow extra leaves
            // Note: We don't update extraLeavesThisMonth here, only when leave is APPROVED
        } else if (emp.getRemLeaves() == 0) {
            // If employee has no remaining leaves, check if leave is in current month
            if (!leaveStartMonth.equals(currentYearMonth) || !leaveEndMonth.equals(currentYearMonth)) {
                throw new InsufficientLeavesException(
                    String.format("Cannot apply for leave: You have no remaining leaves. Extra leaves can only be taken within the current month (%s).", 
                                  currentYearMonth.toString()),
                    0,
                    (int) leaveDays
                );
            }
        }

        leave.setEmployee(emp);
        leave.setCreatedAt(LocalDateTime.now());
        leave.setStatus(LeaveStatus.PENDING);
        return leaveRepo.save(leave);
    }

    public List<LeaveRequest> getEmployeeLeaves(Long empId) {

        return leaveRepo.findByEmployeeEmployeeId(empId);
    }

    public LeaveRequest updateStatus(Long leaveId, LeaveStatus status) {
        LeaveRequest leave = leaveRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        Employee e = leave.getEmployee();
        long leaveDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;

        if (status == LeaveStatus.APPROVED) {
            // Get current month and year
            YearMonth currentYearMonth = YearMonth.now();
            YearMonth leaveStartMonth = YearMonth.from(leave.getStartDate());
            YearMonth leaveEndMonth = YearMonth.from(leave.getEndDate());
            
            if (e.getRemLeaves() >= leaveDays) {
                // Normal case: sufficient remaining leaves
                e.setRemLeaves(e.getRemLeaves() - (int) leaveDays);
                employeeRepo.save(e);
            } else if (e.getRemLeaves() == 0) {
                // Case: No remaining leaves, all days are extra leaves
                // Check if leave is within current month
                if (!leaveStartMonth.equals(currentYearMonth) || !leaveEndMonth.equals(currentYearMonth)) {
                    throw new InsufficientLeavesException(
                        String.format("Cannot approve leave: Employee has no remaining leaves and leave is not within current month (%s).", 
                                      currentYearMonth.toString()),
                        0,
                        (int) leaveDays
                    );
                }
                
                // Add all days to extra leaves for current month
                e.setExtraLeavesThisMonth(e.getExtraLeavesThisMonth() + (int) leaveDays);
                employeeRepo.save(e);
            } else {
                // Case: Partial remaining leaves, some days will be extra
                int extraDaysNeeded = (int) (leaveDays - e.getRemLeaves());
                
                // Check if leave is within current month for the extra days
                if (!leaveStartMonth.equals(currentYearMonth) || !leaveEndMonth.equals(currentYearMonth)) {
                    throw new InsufficientLeavesException(
                        String.format("Cannot approve leave: Employee has %d remaining leaves but requesting %d days. Extra leaves can only be taken within current month (%s).", 
                                      e.getRemLeaves(), leaveDays, currentYearMonth.toString()),
                        e.getRemLeaves(),
                        (int) leaveDays
                    );
                }
                
                // Use remaining leaves and add extra days to extraLeavesThisMonth
                e.setRemLeaves(0); // Use all remaining leaves
                e.setExtraLeavesThisMonth(e.getExtraLeavesThisMonth() + extraDaysNeeded);
                employeeRepo.save(e);
            }
        }

        leave.setStatus(status);
        LeaveRequest updatedLeave = leaveRepo.save(leave);

        // ✅ Send email after saving
        String subject = "Leave Request " + status.name();

        String htmlBody = "<html><body>" +
                "<p>Dear " + e.getFullName() + ",</p>" +
                "<p>Your leave request from <strong>" + leave.getStartDate() + "</strong> to <strong>" + leave.getEndDate() + "</strong> has been <strong style='color:" +
                (status == LeaveStatus.APPROVED ? "green" : "red") + "'>" + status.name() + "</strong>.</p>" +
                "<p>Thank you,<br/>HR Team</p>" +
                "</body></html>";

        emailService.sendHtmlEmail(e.getEmail(), subject, htmlBody);

        return updatedLeave;
    }


    public List<LeaveRequest> getAll() {
        return leaveRepo.findAll();
    }

    public LeaveRequest getLeaveById(Long leaveId) {
        return leaveRepo.findById(leaveId).orElse(null);
    }

    /**
     * Reset extra leaves counter for all employees at the beginning of each month
     * This method should be called by a scheduled job on the 1st of every month
     */
    public void resetExtraLeavesForNewMonth() {
        List<Employee> allEmployees = employeeRepo.findAll();
        for (Employee employee : allEmployees) {
            employee.setExtraLeavesThisMonth(0);
        }
        employeeRepo.saveAll(allEmployees);
        System.out.println("Reset extraLeavesThisMonth for all " + allEmployees.size() + " employees");
    }
}

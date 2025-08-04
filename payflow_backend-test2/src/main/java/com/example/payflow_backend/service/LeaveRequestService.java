package com.example.payflow_backend.service;

import com.example.payflow_backend.model.*;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import com.example.payflow_backend.service.EmailService; // Add import


import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
            if (e.getRemLeaves() >= leaveDays) {
                e.setRemLeaves(e.getRemLeaves() - (int) leaveDays);
                employeeRepo.save(e);
            } else {
                throw new RuntimeException("Insufficient remaining leaves");
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
}

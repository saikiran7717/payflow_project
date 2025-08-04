package com.example.payflow_backend.controller;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.LeaveRequest;
import com.example.payflow_backend.model.LeaveStatus;
import com.example.payflow_backend.model.User;
import com.example.payflow_backend.repository.EmployeeRepository;
import com.example.payflow_backend.repository.UserRepository;
import com.example.payflow_backend.service.LeaveRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveController {

    private final LeaveRequestService leaveService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveController(LeaveRequestService leaveService, UserRepository userRepository, EmployeeRepository employeeRepository) {
        this.leaveService = leaveService;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    // ✅ EMPLOYEE: Apply for leave
    @PostMapping("/apply/{employeeId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequest> applyLeave(@PathVariable Long employeeId,
                                                   @RequestBody LeaveRequest leaveRequest) {
        LeaveRequest saved = leaveService.applyLeave(employeeId, leaveRequest);
        return ResponseEntity.ok(saved);
    }

    // ✅ EMPLOYEE: Get own leave requests
    @GetMapping("/{employeeId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequest>> getLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId));
    }

    // ✅ HR/MANAGER: Approve or reject a leave
    @PutMapping("/{leaveId}/status")
    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long leaveId,
                                              @RequestParam LeaveStatus status,
                                              Authentication authentication) {
        // Check if the user is a manager
        if (authentication != null) {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            
            if (currentUser != null && "MANAGER".equals(currentUser.getRole())) {
                // Manager can only approve leaves from their own employees
                LeaveRequest leaveRequest = leaveService.getLeaveById(leaveId);
                if (leaveRequest != null) {
                    Employee employee = leaveRequest.getEmployee();
                    if (employee == null || employee.getManager() == null || 
                        !employee.getManager().getUserId().equals(currentUser.getUserId())) {
                        return ResponseEntity.status(403).body("Access denied. You can only manage leaves of your own employees.");
                    }
                }
            }
        }
        
        LeaveRequest updated = leaveService.updateStatus(leaveId, status);
        return ResponseEntity.ok(updated);
    }

    // ✅ HR/MANAGER: View all leave requests (optional)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves(Authentication authentication) {
        // Check if the user is a manager
        if (authentication != null) {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            
            if (currentUser != null && "MANAGER".equals(currentUser.getRole())) {
                // Manager can only see leave requests from their own employees
                List<Employee> managedEmployees = employeeRepository.findByManagerUserIdAndIsActiveTrue(currentUser.getUserId());
                List<LeaveRequest> managerLeaves = new ArrayList<>();
                
                for (Employee emp : managedEmployees) {
                    managerLeaves.addAll(leaveService.getEmployeeLeaves(emp.getEmployeeId()));
                }
                
                return ResponseEntity.ok(managerLeaves);
            }
        }
        
        // HR can see all leave requests
        return ResponseEntity.ok(leaveService.getAll());
    }
}

package com.example.payflow_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    private String fullName;
    private String email;
    private int age;
    private String gender;
    private int totalExperience;
    private int totalLeaves;
    private int remLeaves;

    // Field for tracking extra leaves taken in current month when remLeaves is 0
    // This field should be reset to 0 at the beginning of each month
    // Used for salary calculation when employee takes leave without remaining balance
    @Column(name = "extra_leaves_this_month", nullable = false)
    @Builder.Default
    private int extraLeavesThisMonth = 0;

    private String passwordHash;
    private boolean isTempPassword;

    @ManyToOne
    @JoinColumn(name = "onboarded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User onboardedBy;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User manager;

    private LocalDateTime onboardedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // 🔽 New Fields
    private String phone;
    private String address;
    private String department;
    private String designation;

    private String degree;
    private String university;
    private String graduationYear;
    private String grade;

    // 🔽 One-to-Many Relationship with PastExperience
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<PastExperience> pastExperiences;

    // 🔽 One-to-Many Relationship with CTC Details
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnore  // Exclude from JSON serialization to prevent lazy loading issues
    private List<CTC> ctcDetails;

    // 🔽 One-to-Many Relationship with Payroll Records
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnore  // Exclude from JSON serialization to prevent lazy loading issues
    private List<Payroll> payrollRecords;


    public boolean isTempPassword() {
        return isTempPassword;
    }

    public void setIsTempPassword(boolean isTempPassword) {
        this.isTempPassword = isTempPassword;
    }
}

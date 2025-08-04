package com.example.payflow_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    private int totalExperience;

    private String passwordHash;
    private boolean isTempPassword;

    @ManyToOne
    @JoinColumn(name = "onboarded_by")
    private User onboardedBy;

    private LocalDateTime onboardedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // 🔽 New Fields
    private String phone;
    private String address;
    private String department;
    private String position;

    private String degree;
    private String university;
    private String graduationYear;
    private String grade;

    // 🔽 One-to-Many Relationship with PastExperience
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<PastExperience> pastExperiences;


    public boolean isTempPassword() {
        return isTempPassword;
    }

    public void setIsTempPassword(boolean isTempPassword) {
        this.isTempPassword = isTempPassword;
    }
}

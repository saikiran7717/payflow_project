package com.example.payflow_backend.model;

import jakarta.persistence.*;
import lombok.*;

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

    @Lob
    private String pastExperience;

    private String passwordHash;

    private boolean isTempPassword;


    @ManyToOne
    @JoinColumn(name = "onboarded_by")
    private User onboardedBy;

    private java.time.LocalDateTime onboardedAt;

    public boolean isTempPassword() {
        return isTempPassword;
    }

    public void setIsTempPassword(boolean isTempPassword) {
        this.isTempPassword = isTempPassword;
    }
}

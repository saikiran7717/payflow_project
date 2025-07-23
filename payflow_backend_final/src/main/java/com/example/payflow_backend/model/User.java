package com.example.payflow_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String role;

    @Column(nullable = false)
    private Boolean isTempPassword = false;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = true)
    private boolean status = true;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private Admin createdBy;
}

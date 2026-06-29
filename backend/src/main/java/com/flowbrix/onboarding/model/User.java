package com.flowbrix.onboarding.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String password; // For demo, we store plaintext or basic hash
    
    private String email;
    
    private String fullName;

    private String role; // EMPLOYEE, HR_ADMIN, MANAGER, IT_SUPPORT

    private String status; // REGISTERED, PROFILE_COMPLETED, DOCS_UPLOADED, VERIFIED, TASKS_ASSIGNED, APPROVED, ASSETS_ALLOCATED, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String qrCodeData; // Base64 encoded QR Code image

    // Profile Details (simplifying profile completion phase)
    private String phone;
    private String address;
    private String bankName;
    private String bankAccountNumber;
}

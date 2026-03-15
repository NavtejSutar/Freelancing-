package com.freelancing.entity;

import com.freelancing.entity.enums.UserRole;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // FIX: renamed from "isActive" to "active".
    // Lombok @Getter on a boolean field named "isActive" generates isIsActive() — double "is".
    // Renamed to "active" so Lombok generates isActive() and setActive() as expected.
    // @Column(name = "is_active") keeps the existing DB column name — no migration needed.
    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    // FIX: same issue — renamed from "isBanned" to "banned".
    // Lombok was generating isIsBanned() / setIsBanned() which no caller could reach.
    @Column(name = "is_banned")
    @Builder.Default
    private boolean banned = false;

    @Column(name = "email_verified")
    @Builder.Default
    private boolean emailVerified = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FreelancerProfile freelancerProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ClientProfile clientProfile;
}
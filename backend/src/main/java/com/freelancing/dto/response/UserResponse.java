package com.freelancing.dto.response;

import com.freelancing.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String avatarUrl;
    private UserRole role;
    private boolean active;   // FIX: was "isActive" — Lombok/Jackson strips "is" prefix from boolean getters,
                               // so the JSON key was "active" but frontend was reading "isActive" (undefined).
    private boolean banned;   // ADDED: was missing from response, needed to distinguish banned vs pending
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
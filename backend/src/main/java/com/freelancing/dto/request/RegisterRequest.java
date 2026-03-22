package com.freelancing.dto.request;

import com.freelancing.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    private String phoneNumber;

    // ── FREELANCER fields ──
    private String firstName;
    private String lastName;
    private String aadhaarNumber;

    // ── CLIENT fields ──
    private String companyName;
    private String gstinNumber;
}
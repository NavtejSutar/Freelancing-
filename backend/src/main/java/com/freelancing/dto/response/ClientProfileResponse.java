package com.freelancing.dto.response;

import com.freelancing.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientProfileResponse {
    private Long id;
    private String industry;
    private String website;
    private String city;
    private String country;
    private String gstinNumber;
    private VerificationStatus verificationStatus;
    private String verificationNote;
    private BigDecimal totalSpent;
    private Double avgRating;
    private Integer totalReviews;
    private UserResponse user;
    private CompanyResponse company;
    private LocalDateTime createdAt;
}
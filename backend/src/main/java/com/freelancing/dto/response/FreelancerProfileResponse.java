package com.freelancing.dto.response;

import com.freelancing.entity.enums.AvailabilityStatus;
import com.freelancing.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfileResponse {
    private Long id;
    private String title;
    private String bio;
    private BigDecimal hourlyRate;
    private AvailabilityStatus availabilityStatus;
    private String city;
    private String country;
    private BigDecimal totalEarnings;
    private Double avgRating;
    private Integer totalReviews;
    private String aadhaarNumber;
    private VerificationStatus verificationStatus;
    private String verificationNote;
    private UserResponse user;
    private Set<SkillResponse> skills;
    private List<PortfolioItemResponse> portfolioItems;
    private List<EducationResponse> educationList;
    private LocalDateTime createdAt;
}
package com.freelancing.dto.response;

import com.freelancing.entity.enums.AvailabilityStatus;
import com.freelancing.entity.enums.FreelancerJobStatus;
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
    private FreelancerJobStatus jobStatus;
    private String city;
    private String country;
    private BigDecimal totalEarnings;
    private Double avgRating;
    private Integer totalReviews;
    private UserResponse user;
    private Set<SkillResponse> skills;
    private List<PortfolioItemResponse> portfolioItems;
    private List<EducationResponse> educationList;
    private LocalDateTime createdAt;

    // Aadhaar verification (your feature)
    private String aadhaarNumber;
    private VerificationStatus verificationStatus;
    private String verificationNote;

    // Contracts list for jobs-completed tracking (friend's feature)
    private List<ContractResponse> contracts;
}
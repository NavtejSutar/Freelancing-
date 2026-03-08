package com.freelancing.dto.request;

import com.freelancing.entity.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class FreelancerProfileRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String bio;
    private BigDecimal hourlyRate;
    private AvailabilityStatus availabilityStatus;
    private String city;
    private String country;
    private Set<Long> skillIds;
}

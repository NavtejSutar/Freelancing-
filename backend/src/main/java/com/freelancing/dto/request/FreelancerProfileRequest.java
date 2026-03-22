package com.freelancing.dto.request;

import com.freelancing.entity.enums.AvailabilityStatus;
import com.freelancing.entity.enums.FreelancerJobStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class FreelancerProfileRequest {
    private String title;
    private String bio;
    private BigDecimal hourlyRate;
    private AvailabilityStatus availabilityStatus;
    private FreelancerJobStatus jobStatus;
    private String city;
    private String country;
    private List<Long> skillIds;
}
package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProposalRequest {
    @NotNull(message = "Job post ID is required")
    private Long jobPostId;

    @NotBlank(message = "Cover letter is required")
    private String coverLetter;

    @NotNull(message = "Proposed rate is required")
    private BigDecimal proposedRate;

    private String estimatedDuration;
}

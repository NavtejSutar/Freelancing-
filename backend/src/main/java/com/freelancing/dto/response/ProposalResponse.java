package com.freelancing.dto.response;

import com.freelancing.entity.enums.ProposalStatus;
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
public class ProposalResponse {
    private Long id;
    private String coverLetter;
    private BigDecimal proposedRate;
    private String estimatedDuration;
    private ProposalStatus status;
    private Long freelancerId;
    private String freelancerName;
    private Long jobPostId;
    private String jobPostTitle;
    private String coverLetterPdfUrl; // ADDED: URL to uploaded PDF cover letter
    private LocalDateTime createdAt;
}
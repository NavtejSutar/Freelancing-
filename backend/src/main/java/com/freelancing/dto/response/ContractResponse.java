package com.freelancing.dto.response;

import com.freelancing.entity.enums.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal totalAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ContractStatus status;
    private boolean clientAccepted;
    private boolean freelancerAccepted;
    private String clientSignatureUrl;
    private String freelancerSignatureUrl;
    private LocalDateTime clientSignedAt;
    private LocalDateTime freelancerSignedAt;
    private Long freelancerId;
    private String freelancerName;
    // FIX: added freelancerUserId and clientUserId so the frontend knows
    // who to message without needing a separate user lookup
    private Long freelancerUserId;
    private Long clientId;
    private String clientName;
    private Long clientUserId;
    private Long jobPostId;
    private String jobPostTitle;
    private Long proposalId;
    private List<MilestoneResponse> milestones;
    private LocalDateTime createdAt;
}
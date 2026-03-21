package com.freelancing.dto.response;

import com.freelancing.entity.enums.BudgetType;
import com.freelancing.entity.enums.ExperienceLevel;
import com.freelancing.entity.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostResponse {
    private Long id;
    private String title;
    private String description;
    private BudgetType budgetType;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String duration;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private LocalDateTime deadline;
    private Long clientId;
    private String clientName;
    private Long clientUserId; // ADDED: the User.id of the client — used by frontend to check ownership
    private Set<SkillResponse> skills;
    private int proposalCount;
    private LocalDateTime createdAt;
}
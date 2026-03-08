package com.freelancing.dto.request;

import com.freelancing.entity.enums.BudgetType;
import com.freelancing.entity.enums.ExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class JobPostRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private BudgetType budgetType;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String duration;
    private ExperienceLevel experienceLevel;
    private LocalDateTime deadline;
    private Set<Long> skillIds;
}

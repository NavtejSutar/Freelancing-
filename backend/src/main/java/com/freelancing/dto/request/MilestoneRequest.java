package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MilestoneRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    // FIX: was LocalDateTime — the frontend date picker sends "2026-03-19" (date only, no time part)
    // which cannot be parsed as LocalDateTime. Accept as String and let the service parse it.
    private String dueDate;

    private Integer sortOrder;
}
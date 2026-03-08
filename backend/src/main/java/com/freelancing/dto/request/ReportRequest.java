package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;
    private String targetType;
    private Long targetId;
}

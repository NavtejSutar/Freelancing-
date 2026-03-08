package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DisputeRequest {
    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;
}

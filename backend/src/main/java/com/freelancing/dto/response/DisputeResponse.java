package com.freelancing.dto.response;

import com.freelancing.entity.enums.DisputeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeResponse {
    private Long id;
    private String reason;
    private String description;
    private DisputeStatus status;
    private String resolution;
    private LocalDateTime resolvedAt;
    private Long contractId;
    private Long initiatorId;
    private String initiatorName;
    private LocalDateTime createdAt;
}

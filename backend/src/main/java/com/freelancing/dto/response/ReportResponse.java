package com.freelancing.dto.response;

import com.freelancing.entity.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private String reason;
    private String description;
    private ReportStatus status;
    private String targetType;
    private Long targetId;
    private String adminNote;
    private Long reporterId;
    private String reporterName;
    private LocalDateTime createdAt;
}

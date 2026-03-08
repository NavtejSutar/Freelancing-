package com.freelancing.dto.response;

import com.freelancing.entity.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private String description;
    private SubmissionStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private List<String> attachmentUrls;
    private Long milestoneId;
    private LocalDateTime createdAt;
}

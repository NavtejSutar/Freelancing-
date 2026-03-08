package com.freelancing.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmissionRequest {
    private Long milestoneId;
    private String description;
    private List<String> attachmentUrls;
}

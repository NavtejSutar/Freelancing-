package com.freelancing.dto.request;

import lombok.Data;

import java.util.Set;

@Data
public class CreateThreadRequest {
    private String subject;
    private Long contractId;
    private Set<Long> participantIds;
}

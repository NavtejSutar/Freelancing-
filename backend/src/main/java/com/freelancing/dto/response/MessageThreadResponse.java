package com.freelancing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageThreadResponse {
    private Long id;
    private String subject;
    private LocalDateTime lastMessageAt;
    private Long contractId;
    private Set<UserResponse> participants;
    private MessageResponse lastMessage;
    private LocalDateTime createdAt;
}

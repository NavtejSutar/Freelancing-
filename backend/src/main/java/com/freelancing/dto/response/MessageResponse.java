package com.freelancing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private String content;
    private String attachmentUrl;
    private boolean isRead;
    private LocalDateTime sentAt;
    private Long threadId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
}

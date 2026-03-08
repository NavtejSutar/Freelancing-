package com.freelancing.dto.response;

import com.freelancing.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String content;
    private boolean isRead;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
}

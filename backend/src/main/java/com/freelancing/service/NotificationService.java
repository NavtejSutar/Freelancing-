package com.freelancing.service;

import com.freelancing.dto.response.NotificationResponse;
import com.freelancing.entity.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationResponse> getNotifications(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId);
    void send(Long userId, NotificationType type, String title, String content, Long referenceId, String referenceType);
}

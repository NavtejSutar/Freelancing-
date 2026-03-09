package com.freelancing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message extends BaseEntity {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private MessageThread thread;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
}

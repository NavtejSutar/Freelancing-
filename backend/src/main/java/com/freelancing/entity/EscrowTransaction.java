package com.freelancing.entity;

import com.freelancing.entity.enums.EscrowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscrowTransaction extends BaseEntity {

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EscrowStatus status = EscrowStatus.FUNDED;

    @Column(name = "funded_at")
    private LocalDateTime fundedAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;
}

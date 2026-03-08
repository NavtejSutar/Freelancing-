package com.freelancing.entity;

import com.freelancing.entity.enums.ProposalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "proposals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proposal extends BaseEntity {

    @Column(name = "cover_letter", columnDefinition = "TEXT", nullable = false)
    private String coverLetter;

    @Column(name = "proposed_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal proposedRate;

    @Column(name = "estimated_duration")
    private String estimatedDuration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProposalStatus status = ProposalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private FreelancerProfile freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;
}

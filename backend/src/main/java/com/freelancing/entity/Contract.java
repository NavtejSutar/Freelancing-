package com.freelancing.entity;

import com.freelancing.entity.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ContractStatus status = ContractStatus.PENDING_ACCEPTANCE;

    @Column(name = "client_accepted")
    @Builder.Default
    private boolean clientAccepted = false;

    @Column(name = "freelancer_accepted")
    @Builder.Default
    private boolean freelancerAccepted = false;

    // ADDED: signature image URLs — stored after each party signs
    @Column(name = "client_signature_url", columnDefinition = "MEDIUMTEXT")
    private String clientSignatureUrl;

    @Column(name = "freelancer_signature_url", columnDefinition = "MEDIUMTEXT")
    private String freelancerSignatureUrl;

    @Column(name = "client_signed_at")
    private LocalDateTime clientSignedAt;

    @Column(name = "freelancer_signed_at")
    private LocalDateTime freelancerSignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private FreelancerProfile freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private ClientProfile client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id")
    private JobPost jobPost;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Milestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Dispute> disputes = new ArrayList<>();

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    @Builder.Default
    private List<MessageThread> messageThreads = new ArrayList<>();

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();
}
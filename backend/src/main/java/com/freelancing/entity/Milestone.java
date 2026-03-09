package com.freelancing.entity;

import com.freelancing.entity.enums.MilestoneStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Milestone extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MilestoneStatus status = MilestoneStatus.PENDING;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Submission> submissions = new ArrayList<>();
}

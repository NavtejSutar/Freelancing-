package com.freelancing.entity;

import com.freelancing.entity.enums.BudgetType;
import com.freelancing.entity.enums.ExperienceLevel;
import com.freelancing.entity.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "job_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type")
    private BudgetType budgetType;

    @Column(name = "budget_min", precision = 10, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 10, scale = 2)
    private BigDecimal budgetMax;

    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    private LocalDateTime deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private ClientProfile client;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "job_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "jobPost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Proposal> proposals = new ArrayList<>();
}

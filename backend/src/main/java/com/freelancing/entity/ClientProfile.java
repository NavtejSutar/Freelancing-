package com.freelancing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "client_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientProfile extends BaseEntity {

    private String industry;
    private String website;
    private String city;
    private String country;

    @Column(name = "total_spent", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "avg_rating")
    @Builder.Default
    private Double avgRating = 0.0;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(mappedBy = "clientProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Company company;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobPost> jobPosts = new ArrayList<>();

    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Contract> contracts = new ArrayList<>();
}

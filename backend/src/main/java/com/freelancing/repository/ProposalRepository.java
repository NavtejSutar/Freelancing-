package com.freelancing.repository;

import com.freelancing.entity.Proposal;
import com.freelancing.entity.enums.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    Page<Proposal> findByJobPostId(Long jobPostId, Pageable pageable);
    Page<Proposal> findByFreelancerId(Long freelancerId, Pageable pageable);
    boolean existsByFreelancerIdAndJobPostId(Long freelancerId, Long jobPostId);
    long countByJobPostIdAndStatus(Long jobPostId, ProposalStatus status);
}

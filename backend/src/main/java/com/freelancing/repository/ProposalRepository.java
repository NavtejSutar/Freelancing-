package com.freelancing.repository;

import com.freelancing.entity.Proposal;
import com.freelancing.entity.enums.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    // FIX: JOIN FETCH so freelancer.user and jobPost are loaded in session when mapToResponse runs
    @Query("SELECT p FROM Proposal p JOIN FETCH p.freelancer f JOIN FETCH f.user JOIN FETCH p.jobPost WHERE p.jobPost.id = :jobPostId")
    Page<Proposal> findByJobPostId(@Param("jobPostId") Long jobPostId, Pageable pageable);

    // FIX: queries by freelancerProfile.id (not userId) — used by getProposalsByFreelancer(profileId)
    @Query("SELECT p FROM Proposal p JOIN FETCH p.freelancer f JOIN FETCH f.user JOIN FETCH p.jobPost WHERE p.freelancer.id = :freelancerId")
    Page<Proposal> findByFreelancerId(@Param("freelancerId") Long freelancerId, Pageable pageable);

    // FIX: queries by user.id — used by /my endpoint which only has the userId from JWT
    @Query("SELECT p FROM Proposal p JOIN FETCH p.freelancer f JOIN FETCH f.user u JOIN FETCH p.jobPost WHERE u.id = :userId")
    Page<Proposal> findByFreelancerUserId(@Param("userId") Long userId, Pageable pageable);

    // FIX: eagerly loads relations for single proposal lookup
    @Query("SELECT p FROM Proposal p JOIN FETCH p.freelancer f JOIN FETCH f.user JOIN FETCH p.jobPost WHERE p.id = :id")
    Optional<Proposal> findByIdWithDetails(@Param("id") Long id);

    boolean existsByFreelancerIdAndJobPostId(Long freelancerId, Long jobPostId);
    long countByJobPostIdAndStatus(Long jobPostId, ProposalStatus status);
}
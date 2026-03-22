package com.freelancing.repository;

import com.freelancing.entity.Review;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByRevieweeId(Long revieweeId, Pageable pageable);
    Page<Review> findByReviewerId(Long reviewerId, Pageable pageable);
    Page<Review> findByContractId(Long contractId, Pageable pageable);
    boolean existsByContractIdAndReviewerId(Long contractId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double getAverageRatingForUser(Long userId);

    // Used by ReviewServiceImpl to sync avgRating on FreelancerProfile after each review
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.reviewer.role = :reviewerRole AND r.contract.status = :contractStatus")
    Double getAverageRatingForUserByReviewerRoleAndContractStatus(
            @Param("userId") Long userId,
            @Param("reviewerRole") UserRole reviewerRole,
            @Param("contractStatus") ContractStatus contractStatus);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId AND r.reviewer.role = :reviewerRole AND r.contract.status = :contractStatus")
    Long countReviewsForUserByReviewerRoleAndContractStatus(
            @Param("userId") Long userId,
            @Param("reviewerRole") UserRole reviewerRole,
            @Param("contractStatus") ContractStatus contractStatus);
}
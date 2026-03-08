package com.freelancing.repository;

import com.freelancing.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByRevieweeId(Long revieweeId, Pageable pageable);
    Page<Review> findByReviewerId(Long reviewerId, Pageable pageable);
    Page<Review> findByContractId(Long contractId, Pageable pageable);
    boolean existsByContractIdAndReviewerId(Long contractId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double getAverageRatingForUser(Long userId);
}

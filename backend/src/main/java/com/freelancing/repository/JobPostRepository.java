package com.freelancing.repository;

import com.freelancing.entity.JobPost;
import com.freelancing.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Long> {
    Page<JobPost> findByClientId(Long clientId, Pageable pageable);
    Page<JobPost> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM JobPost j WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR j.status = :status) " +
           "AND (:minBudget IS NULL OR j.budgetMin >= :minBudget) " +
           "AND (:maxBudget IS NULL OR j.budgetMax <= :maxBudget)")
    Page<JobPost> searchJobs(
            @Param("keyword") String keyword,
            @Param("status") JobStatus status,
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            Pageable pageable);
}

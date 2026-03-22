package com.freelancing.repository;

import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {

    Optional<FreelancerProfile> findByUserId(Long userId);

    @Query("SELECT f FROM FreelancerProfile f WHERE " +
           "LOWER(f.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.bio) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<FreelancerProfile> searchFreelancers(@Param("keyword") String keyword, Pageable pageable);

    Page<FreelancerProfile> findByVerificationStatus(VerificationStatus verificationStatus, Pageable pageable);
}
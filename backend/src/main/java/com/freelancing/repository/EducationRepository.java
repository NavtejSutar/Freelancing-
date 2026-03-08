package com.freelancing.repository;

import com.freelancing.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByFreelancerProfileId(Long freelancerProfileId);
}

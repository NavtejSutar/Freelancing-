package com.freelancing.repository;

import com.freelancing.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByMilestoneId(Long milestoneId);
    List<Submission> findByMilestoneContractId(Long contractId);
}

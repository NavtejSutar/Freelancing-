package com.freelancing.service;

import com.freelancing.dto.request.JobPostRequest;
import com.freelancing.dto.response.JobPostResponse;
import com.freelancing.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface JobPostService {
    Page<JobPostResponse> getAllJobs(Pageable pageable);
    JobPostResponse getJobById(Long id);
    JobPostResponse createJob(Long clientProfileId, JobPostRequest request);
    JobPostResponse updateJob(Long id, JobPostRequest request);
    void deleteJob(Long id);
    Page<JobPostResponse> searchJobs(String keyword, JobStatus status, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable);
    Page<JobPostResponse> getJobsByClient(Long clientId, Pageable pageable);
    void addSkillToJob(Long jobId, Long skillId);
    void removeSkillFromJob(Long jobId, Long skillId);
}
